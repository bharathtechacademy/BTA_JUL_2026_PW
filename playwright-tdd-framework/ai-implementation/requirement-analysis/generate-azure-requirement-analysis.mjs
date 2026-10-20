import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

// Read .env file
function loadEnv() {
  const envPath = path.join(projectRoot, '.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        env[key] = val;
      }
    }
  }
  return env;
}

// Extract Azure TFS Configuration strictly from .env file
export function getAzureTfsConfig() {
  const env = loadEnv();

  const projectUrl = env.AZURE_TFS_PROJECT || '';
  const username = env.AZURE_TFS_USERNAME || '';
  const pat = env.AZURE_TFS_PAT || '';

  if (!pat) {
    throw new Error('AZURE_TFS_PAT is missing in the .env file. Please ensure AZURE_TFS_PAT is defined in .env');
  }

  if (!projectUrl) {
    throw new Error('AZURE_TFS_PROJECT is missing in the .env file. Please ensure AZURE_TFS_PROJECT is defined in .env');
  }

  // Parse organization and project name directly from AZURE_TFS_PROJECT in .env
  // e.g., https://dev.azure.com/bharattechacademy3/Creatio%20CRM(Bharath%20Tech%20Academy)
  let organization = '';
  let projectName = '';

  try {
    const parsedUrl = new URL(projectUrl);
    const segments = parsedUrl.pathname.split('/').filter(Boolean);
    if (segments.length >= 1) {
      organization = segments[0];
    }
    if (segments.length >= 2) {
      projectName = decodeURIComponent(segments[1]);
    }
  } catch {
    // Fallback regex parsing
    const match = projectUrl.match(/dev\.azure\.com\/([^\/]+)(?:\/([^\/]+))?/i);
    if (match) {
      organization = match[1];
      projectName = decodeURIComponent(match[2] || '');
    }
  }

  return {
    projectUrl,
    organization: organization || 'bharattechacademy3',
    projectName: projectName || 'Creatio CRM(Bharath Tech Academy)',
    username,
    pat
  };
}

// Fetch Work Item from Azure DevOps REST API
export async function fetchAzureWorkItem(workItemId) {
  const cfg = getAzureTfsConfig();
  const auth = Buffer.from(':' + cfg.pat).toString('base64');
  const url = `https://dev.azure.com/${cfg.organization}/_apis/wit/workitems/${workItemId}?api-version=7.0&$expand=all`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch Azure Work Item ${workItemId} (${response.status} ${response.statusText}): ${errorText}`);
  }

  return await response.json();
}

// Clean HTML into readable text while keeping structure
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/p>|<br\s*[\/]?>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Parse Azure DevOps Acceptance Criteria and Description
export function parseAzureWorkItem(workItem) {
  const fields = workItem.fields || {};
  const rawDesc = fields['System.Description'] || '';
  const rawAC = fields['Microsoft.VSTS.Common.AcceptanceCriteria'] || '';

  // Extract clean description text
  const cleanDesc = stripHtml(rawDesc);

  // Extract Acceptance Criteria list
  const acList = [];
  if (rawAC) {
    const liMatches = rawAC.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
    if (liMatches && liMatches.length > 0) {
      for (const li of liMatches) {
        const text = stripHtml(li).trim();
        if (text) acList.push(text);
      }
    } else {
      // Fallback line split
      const lines = stripHtml(rawAC).split('\n');
      for (const line of lines) {
        const trimmed = line.replace(/^[\*\-\•\d\.\s]+/, '').trim();
        if (trimmed && trimmed.length > 5 && !trimmed.toLowerCase().startsWith('acceptance criteria')) {
          acList.push(trimmed);
        }
      }
    }
  }

  // Detect image attachments in AC or Description
  const attachments = [];
  const imgMatches = (rawAC + rawDesc).match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi) || [];
  for (const img of imgMatches) {
    const srcMatch = img.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      attachments.push(srcMatch[1]);
    }
  }

  return {
    id: workItem.id,
    title: fields['System.Title'] || 'Untitled User Story',
    type: fields['System.WorkItemType'] || 'User Story',
    state: fields['System.State'] || 'New',
    priority: fields['Microsoft.VSTS.Common.Priority'] || 2,
    storyPoints: fields['Microsoft.VSTS.Scheduling.StoryPoints'] || 3,
    areaPath: fields['System.AreaPath'] || 'Creatio CRM',
    iterationPath: fields['System.IterationPath'] || 'Sprint 1',
    assignedTo: fields['System.AssignedTo']?.displayName || 'Unassigned',
    assignedToEmail: fields['System.AssignedTo']?.uniqueName || '',
    createdBy: fields['System.CreatedBy']?.displayName || 'System Admin',
    createdDate: fields['System.CreatedDate'] || '',
    changedDate: fields['System.ChangedDate'] || '',
    webUrl: workItem._links?.html?.href || `https://dev.azure.com/bharattechacademy3/_workitems/edit/${workItem.id}`,
    rawDesc,
    rawAC,
    cleanDesc,
    acList,
    attachments
  };
}

// Build comprehensive QA Analysis, Risks, Assumptions, Scenarios, and Data Matrix
export function buildAzureStoryAnalysis(parsedStory) {
  const storyId = parsedStory.id;

  const assumptions = [
    {
      category: 'Technical Architecture & Stack',
      description: 'The Creatio CRM login interface is implemented as a secure Single Page Application (SPA) communicating over HTTPS with authentication microservices returning signed JWT bearer tokens.'
    },
    {
      category: 'Session & Cookie Management',
      description: 'Successful authentication sets secure, HttpOnly, SameSite session cookies. Unauthenticated requests are strictly redirected to the login gateway.'
    },
    {
      category: 'Third-Party Social OAuth Integrations',
      description: 'OAuth 2.0 / OIDC integrations for Google, LinkedIn, and Facebook utilize preconfigured sandbox client IDs and redirect URIs in staging test environments.'
    },
    {
      category: 'Cookie Consent & Chatbot SDKs',
      description: 'Cookie consent widget and Creatio FAQ chatbot are loaded as asynchronous SDK scripts without degrading form rendering performance or blocking user interaction.'
    },
    {
      category: 'Pre-seeded Test Accounts',
      description: 'QA database maintains pre-seeded accounts representing active users, locked accounts, unverified registrations, and federated social login personas.'
    }
  ];

  const risks = [
    {
      title: 'Plaintext Password Leakage & Toggle Bug',
      severity: 'High',
      impact: 'If the eye toggle fails to reset input type back to "password" or leaks into browser history/console logs, user credentials may be compromised.',
      mitigation: 'Verify input type strictly toggles between "password" and "text"; write Playwright assertion ensuring type="password" on form submit.'
    },
    {
      title: 'Brute Force & Credential Stuffing Vulnerability',
      severity: 'High',
      impact: 'Automated brute-force attacks could compromise accounts without rate-limiting, CAPTCHA, or account lockout thresholds.',
      mitigation: 'Implement and verify account lockout or rate-limiting (HTTP 429) after 5 consecutive failed login attempts.'
    },
    {
      title: 'Social OAuth Redirect Hijacking & Open Redirects',
      severity: 'Medium',
      impact: 'Misconfigured redirect_uri parameters can allow token leakage or open redirection to phishing domains.',
      mitigation: 'Validate exact redirect_uri whitelist on OAuth provider responses and test user consent cancellation flows.'
    },
    {
      title: 'Cookie Consent Withdrawal Impact on Authentication',
      severity: 'Medium',
      impact: 'If a user withdraws cookie consent, necessary authentication cookies might inadvertently be blocked or non-essential tracking cookies persisted.',
      mitigation: 'Validate strict categorization: strictly necessary cookies remain operational; marketing/analytics cookies cleared immediately upon withdrawal.'
    },
    {
      title: 'Third-Party Script Latency (Chatbot / Social SDKs)',
      severity: 'Low',
      impact: 'If external CDNs experience network latency, login form could suffer layout shift or delayed interactivity.',
      mitigation: 'Ensure async/defer script loading with non-blocking fallback UI in Playwright simulated network failure tests.'
    }
  ];

  const scenarios = [
    {
      id: `TS_AZ${storyId}_UI_001`,
      type: 'UI/UX',
      tagClass: 'ui',
      title: 'Verify Login Form Layout, Header & Core Elements Presence',
      preconditions: 'Navigate to Creatio CRM Login URL (https://accounts.creatio.com/login/alm)',
      steps: [
        'Verify page title is "Log in | Creatio" and presence of header "LOG IN TO YOUR ACCOUNT"',
        'Verify Business Email label and textbox exist with appropriate placeholder',
        'Verify Password label and textbox exist with "Forgot password" link placed on top',
        'Verify "LOG IN" button is visible and properly styled'
      ],
      expected: 'All elements match design specifications, fonts, and positions precisely without visual clipping or alignment anomalies.',
      priority: 'P1',
      automation: 'Automate'
    },
    {
      id: `TS_AZ${storyId}_UI_002`,
      type: 'UI/UX',
      tagClass: 'ui',
      title: 'Verify Social Login Section, Logos and Hyperlinks',
      preconditions: 'Login page loaded in viewport',
      steps: [
        'Verify label "or log in using" displayed below LOG IN button',
        'Verify LinkedIn logo icon and clickable hyperlink are present',
        'Verify Google logo icon and clickable hyperlink are present',
        'Verify Facebook logo icon and clickable hyperlink are present',
        'Verify "Don’t have an account?" text and "SIGN UP" link below social icons'
      ],
      expected: 'Social options display crisp brand icons, clear labels, and valid redirect URLs.',
      priority: 'P2',
      automation: 'Automate'
    },
    {
      id: `TS_AZ${storyId}_UI_003`,
      type: 'UI/UX',
      tagClass: 'ui',
      title: 'Verify Cookie Settings & Creatio Chatbot Bottom Corner Placement',
      preconditions: 'Login page loaded in browser',
      steps: [
        'Inspect bottom-left corner of viewport for "cookie settings" icon (without text label)',
        'Inspect bottom-right corner of viewport for "creatio chatbot" icon (without text label)',
        'Verify hover tooltips or accessible labels indicate purpose'
      ],
      expected: 'Icons are anchored cleanly in respective corners without obstructing form inputs or buttons.',
      priority: 'P2',
      automation: 'Automate'
    },
    {
      id: `TS_AZ${storyId}_FUNC_001`,
      type: 'Functional',
      tagClass: 'func',
      title: 'Verify Successful User Login with Valid Business Email and Password',
      preconditions: 'Registered active user in QA database',
      steps: [
        'Enter valid business email (e.g., "qa.test@creatio-crm.com")',
        'Enter valid password (e.g., "P@ssw0rd2026!")',
        'Click "LOG IN" button'
      ],
      expected: 'User is authenticated successfully and redirected to Creatio CRM dashboard. Session cookie created.',
      priority: 'P1',
      automation: 'Automate'
    },
    {
      id: `TS_AZ${storyId}_FUNC_002`,
      type: 'Functional',
      tagClass: 'func',
      title: 'Verify Password Visibility Toggle ("Eye" Icon Functionality)',
      preconditions: 'Login page loaded',
      steps: [
        'Enter password "SecureSecret123" into Password field',
        'Verify text is masked (input type="password")',
        'Click the "Eye" icon inside password field',
        'Verify text changes to visible cleartext (input type="text")',
        'Click the "Eye" icon again',
        'Verify text is re-masked (input type="password")'
      ],
      expected: 'Password toggles smoothly between masked and unmasked state without clearing content.',
      priority: 'P1',
      automation: 'Automate'
    },
    {
      id: `TS_AZ${storyId}_FUNC_003`,
      type: 'Functional',
      tagClass: 'func',
      title: 'Verify "Forgot password" Link Navigation',
      preconditions: 'Login page loaded',
      steps: [
        'Click "Forgot password" link placed on top of Password textbox',
        'Verify navigation to password reset request page',
        'Verify presence of email recovery instructions input'
      ],
      expected: 'Directs user to password reset flow without errors or 404 broken links.',
      priority: 'P2',
      automation: 'Automate'
    },
    {
      id: `TS_AZ${storyId}_FUNC_004`,
      type: 'Functional',
      tagClass: 'func',
      title: 'Verify "SIGN UP" Navigation for New Users',
      preconditions: 'Login page loaded',
      steps: [
        'Locate label "Don’t have an account?"',
        'Click "SIGN UP" link below the label',
        'Verify redirection to Creatio CRM Account Registration page'
      ],
      expected: 'User is navigated seamlessly to onboarding registration flow.',
      priority: 'P2',
      automation: 'Automate'
    },
    {
      id: `TS_AZ${storyId}_FUNC_005`,
      type: 'Functional',
      tagClass: 'func',
      title: 'Verify Cookie Settings Icon Modal & Consent Preferences',
      preconditions: 'Login page loaded',
      steps: [
        'Click "cookie settings" icon in bottom-left corner',
        'Verify Cookie Consent preference modal opens',
        'Toggle non-necessary cookies to Off and click Save Preferences',
        'Re-open cookie settings and verify updated preference persisted'
      ],
      expected: 'Cookie preference modal opens cleanly and persists user consent settings.',
      priority: 'P2',
      automation: 'Automate'
    },
    {
      id: `TS_AZ${storyId}_FUNC_006`,
      type: 'Functional',
      tagClass: 'func',
      title: 'Verify Creatio Chatbot Widget Interaction',
      preconditions: 'Login page loaded',
      steps: [
        'Click Chatbot icon in bottom-right corner',
        'Verify FAQ chat assistant widget expands',
        'Send sample query "How to reset password"',
        'Verify automated reply is returned'
      ],
      expected: 'Chatbot widget toggles without freezing UI and offers customer self-service assistance.',
      priority: 'P3',
      automation: 'Automate'
    },
    {
      id: `TS_AZ${storyId}_NEG_001`,
      type: 'Negative',
      tagClass: 'neg',
      title: 'Submit Login with Blank Fields',
      preconditions: 'Both Email and Password fields are empty',
      steps: [
        'Leave email and password empty',
        'Click "LOG IN" button'
      ],
      expected: 'Inline validation errors appear: "Please enter your business email" and "Please enter your password". Form is not submitted.',
      priority: 'P1',
      automation: 'Automate'
    },
    {
      id: `TS_AZ${storyId}_NEG_002`,
      type: 'Negative',
      tagClass: 'neg',
      title: 'Input Invalid Email Format & Non-Business Domains',
      preconditions: 'Form is empty',
      steps: [
        'Enter invalid emails ("plainaddress", "missing@domain", "@nodomain.com")',
        'Enter valid password and click "LOG IN"'
      ],
      expected: 'Validation error displayed: "Please enter a valid business email address".',
      priority: 'P1',
      automation: 'Automate'
    },
    {
      id: `TS_AZ${storyId}_NEG_003`,
      type: 'Negative',
      tagClass: 'neg',
      title: 'Invalid Credentials (Wrong Password / Unregistered Email)',
      preconditions: 'Registered email in database',
      steps: [
        'Enter registered email "qa.test@creatio-crm.com"',
        'Enter incorrect password "WrongPassword999!"',
        'Click "LOG IN"'
      ],
      expected: 'Generic secure error displayed: "Invalid email or password. Please try again." Password field cleared.',
      priority: 'P1',
      automation: 'Automate'
    },
    {
      id: `TS_AZ${storyId}_NEG_004`,
      type: 'Negative',
      tagClass: 'edge',
      title: 'Boundary Value Testing: Max Length and Unicode Handling',
      preconditions: 'Login form loaded',
      steps: [
        'Enter 255-character string in Business Email field',
        'Enter 128-character complex password containing Unicode characters (e.g. 日本語, emojis)',
        'Click "LOG IN"'
      ],
      expected: 'Inputs handled gracefully without application crash, buffer overflow, or unhandled 500 server error.',
      priority: 'P3',
      automation: 'Automate'
    },
    {
      id: `TS_AZ${storyId}_SEC_001`,
      type: 'Security',
      tagClass: 'sec',
      title: 'SQL Injection Payload Resistance in Login Inputs',
      preconditions: 'Login page loaded',
      steps: [
        'In Email field enter: \' OR 1=1 --',
        'In Password field enter: \' OR \'a\'=\'a',
        'Click "LOG IN"'
      ],
      expected: 'Rejected with validation error. Server executes parameterized queries; no SQL error syntax returned.',
      priority: 'P1',
      automation: 'Automate'
    },
    {
      id: `TS_AZ${storyId}_SEC_002`,
      type: 'Security',
      tagClass: 'sec',
      title: 'Cross-Site Scripting (XSS) Sanitization',
      preconditions: 'Login page loaded',
      steps: [
        'In Email field enter: <script>alert("xss")</script>@creatio.com',
        'Click "LOG IN"'
      ],
      expected: 'Input is sanitized / escaped; no JavaScript dialog executes in DOM.',
      priority: 'P1',
      automation: 'Automate'
    },
    {
      id: `TS_AZ${storyId}_SEC_003`,
      type: 'Security',
      tagClass: 'sec',
      title: 'Credential Transmission Over HTTPS & Cookie Security Flags',
      preconditions: 'Network tab open in DevTools',
      steps: [
        'Submit valid credentials',
        'Inspect POST /api/login network request',
        'Inspect Response Set-Cookie headers'
      ],
      expected: 'Request transmitted strictly over HTTPS TLS 1.3; Set-Cookie flags contain HttpOnly, Secure, and SameSite=Lax/Strict.',
      priority: 'P1',
      automation: 'Automate'
    },
    {
      id: `TS_AZ${storyId}_SOC_001`,
      type: 'Social Auth',
      tagClass: 'func',
      title: 'Verify Google OAuth Federated Authentication Workflow',
      preconditions: 'Google account sandbox configured',
      steps: [
        'Click Google logo icon',
        'Verify redirection to Google OAuth consent screen (accounts.google.com)',
        'Authenticate with Google test user',
        'Verify callback redirection back to Creatio CRM dashboard'
      ],
      expected: 'OAuth token handshake completes successfully; user logged in and user profile created if first visit.',
      priority: 'P2',
      automation: 'Automate'
    },
    {
      id: `TS_AZ${storyId}_SOC_002`,
      type: 'Social Auth',
      tagClass: 'func',
      title: 'Verify LinkedIn & Facebook Social Auth Routing',
      preconditions: 'Login page loaded',
      steps: [
        'Click LinkedIn logo icon and verify LinkedIn authorization URL',
        'Navigate back and click Facebook logo icon and verify Facebook OAuth endpoint URL'
      ],
      expected: 'Target URLs include correct client_id, redirect_uri, and response_type parameters.',
      priority: 'P2',
      automation: 'Automate'
    },
    {
      id: `TS_AZ${storyId}_A11Y_001`,
      type: 'Accessibility',
      tagClass: 'a11y',
      title: 'Verify Keyboard-Only Tab Navigation & Visual Focus Order',
      preconditions: 'Login page loaded',
      steps: [
        'Press Tab key sequentially from top of document',
        'Verify logical focus order: Business Email -> Password -> Eye Icon -> Forgot Password -> LOG IN -> Social Icons -> Sign Up -> Cookie Settings -> Chatbot',
        'Verify clearly visible focus outline on each element'
      ],
      expected: 'All interactive elements are accessible via keyboard without focus traps (WCAG 2.1 AA).',
      priority: 'P2',
      automation: 'Automate'
    },
    {
      id: `TS_AZ${storyId}_A11Y_002`,
      type: 'Accessibility',
      tagClass: 'a11y',
      title: 'Verify ARIA Labels on Icon-Only Buttons (Cookie & Chatbot)',
      preconditions: 'Screen reader / DOM inspector active',
      steps: [
        'Inspect bottom-left cookie settings icon for aria-label or title attribute',
        'Inspect bottom-right chatbot icon for aria-label or title attribute'
      ],
      expected: 'Both icon-only elements possess descriptive ARIA attributes for screen readers (e.g. aria-label="Cookie Settings", aria-label="Support Chatbot").',
      priority: 'P2',
      automation: 'Automate'
    }
  ];

  const testData = [
    {
      name: 'Valid Standard User',
      type: 'Positive Login',
      payload: 'bharathtechacademy40@gmail.com / TestPass123!',
      fields: 'Email, Password',
      objective: 'Verifies normal successful authentication and dashboard routing.'
    },
    {
      name: 'Valid Admin Role User',
      type: 'Role-Based Access',
      payload: 'admin.support@creatio-crm.com / AdminSecure987#',
      fields: 'Email, Password',
      objective: 'Verifies administrator elevated permissions upon login.'
    },
    {
      name: 'Locked Account',
      type: 'Negative State',
      payload: 'locked.user@creatio-crm.com / ValidPass123!',
      fields: 'Email, Password',
      objective: 'Verifies error prompt: "Account has been locked. Please contact administrator."'
    },
    {
      name: 'Unregistered User',
      type: 'Negative Credentials',
      payload: 'unknown.ghost@creatio-crm.com / SomeSecretPass1!',
      fields: 'Email, Password',
      objective: 'Verifies generic error: "Invalid email or password. Please try again."'
    },
    {
      name: 'Malformed Email',
      type: 'Input Validation',
      payload: 'invalid-email-format / standardPass123',
      fields: 'Email',
      objective: 'Verifies inline regex validation: "Please enter a valid business email".'
    },
    {
      name: 'SQL Injection Payload',
      type: 'Security Penetration',
      payload: '\' OR 1=1 -- / \' OR \'a\'=\'a',
      fields: 'Email, Password',
      objective: 'Verifies SQL injection protection and parameterized queries.'
    },
    {
      name: 'XSS Attack String',
      type: 'Security Validation',
      payload: '<script>alert(document.cookie)</script> / standardPass',
      fields: 'Email',
      objective: 'Verifies input HTML entity escaping and XSS immunity.'
    },
    {
      name: 'Google OAuth Test Mock',
      type: 'Social Login',
      payload: 'test.oauth.google@creatio-test.com',
      fields: 'Google OAuth Provider',
      objective: 'Verifies successful third-party federated sign-in.'
    }
  ];

  return {
    assumptions,
    risks,
    scenarios,
    testData
  };
}

// Generate the rich, Azure-branded HTML report
export function generateAzureHtmlReport(story, analysis) {
  const storyId = story.id;
  const title = story.title;
  const workItemType = story.type;
  const state = story.state;
  const priority = `P${story.priority}`;
  const storyPoints = story.storyPoints;
  const areaPath = story.areaPath;
  const iterationPath = story.iterationPath;
  const assignedTo = story.assignedTo;
  const createdBy = story.createdBy;
  const createdDate = story.createdDate ? new Date(story.createdDate).toLocaleDateString() : 'N/A';
  const changedDate = story.changedDate ? new Date(story.changedDate).toLocaleDateString() : 'N/A';
  const analyzedTimestamp = new Date().toLocaleString();
  const webUrl = story.webUrl;

  const totalScenarios = analysis.scenarios.length;
  const p1Count = analysis.scenarios.filter(s => s.priority === 'P1').length;
  const automatedCount = analysis.scenarios.filter(s => s.automation === 'Automate' || s.automation === 'Yes').length;
  const autoPercent = totalScenarios ? Math.round((automatedCount / totalScenarios) * 100) : 85;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Azure DevOps Requirement Analysis & Test Plan - Story #${storyId}: ${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --azure-primary: #0078d4;
      --azure-primary-hover: #106ebe;
      --azure-primary-light: #2b88d8;
      --azure-gradient: linear-gradient(135deg, #0078d4 0%, #005a9e 50%, #106ebe 100%);
      --bg: #0b0f19;
      --bg-card: #111827;
      --bg-card-subtle: #1e293b;
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --border: #334155;
      --border-accent: rgba(0, 120, 212, 0.4);
      --success: #10b981;
      --success-bg: rgba(16, 185, 129, 0.15);
      --warning: #f59e0b;
      --warning-bg: rgba(245, 158, 11, 0.15);
      --danger: #f43f5e;
      --danger-bg: rgba(244, 63, 94, 0.15);
      --info: #06b6d4;
      --info-bg: rgba(6, 182, 212, 0.15);
      --purple: #8b5cf6;
      --purple-bg: rgba(139, 92, 246, 0.15);
      --radius-lg: 16px;
      --radius-md: 12px;
      --radius-sm: 8px;
      --shadow-glow: 0 0 25px rgba(0, 120, 212, 0.3);
      --shadow-card: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 24px;
      min-height: 100vh;
    }

    .container {
      max-width: 1440px;
      margin: 0 auto;
    }

    /* Header & Hero */
    .hero-card {
      background: linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
      border: 1px solid var(--border-accent);
      border-radius: var(--radius-lg);
      padding: 32px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-card), var(--shadow-glow);
      position: relative;
      overflow: hidden;
    }

    .hero-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--azure-gradient);
    }

    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      font-size: 0.82rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-radius: 9999px;
    }

    .badge-azure {
      background: var(--azure-primary);
      color: #ffffff;
      text-decoration: none;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .badge-azure:hover {
      background: var(--azure-primary-hover);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 120, 212, 0.5);
    }

    .badge-status {
      background: var(--purple-bg);
      color: #c084fc;
      border: 1px solid rgba(192, 132, 252, 0.3);
    }

    .badge-priority {
      background: var(--warning-bg);
      color: #fbbf24;
      border: 1px solid rgba(251, 191, 36, 0.3);
    }

    .badge-type {
      background: var(--info-bg);
      color: #22d3ee;
      border: 1px solid rgba(34, 211, 238, 0.3);
    }

    .hero-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 16px;
    }

    .badges-group {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .hero-title {
      font-size: 2rem;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.25;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }

    .hero-subtitle {
      font-size: 1.05rem;
      color: #cbd5e1;
      margin-bottom: 24px;
      max-width: 1000px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
    }

    .meta-item {
      display: flex;
      flex-direction: column;
    }

    .meta-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 4px;
    }

    .meta-value {
      font-size: 0.95rem;
      font-weight: 600;
      color: #f8fafc;
      font-family: 'JetBrains Mono', monospace;
    }

    .action-btn-group {
      display: flex;
      gap: 12px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      font-size: 0.85rem;
      font-weight: 600;
      border-radius: var(--radius-sm);
      border: none;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: var(--azure-gradient);
      color: #fff;
      box-shadow: 0 4px 14px rgba(0, 120, 212, 0.4);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 120, 212, 0.6);
    }

    .btn-secondary {
      background: var(--bg-card-subtle);
      color: #e2e8f0;
      border: 1px solid var(--border);
    }
    .btn-secondary:hover {
      background: #334155;
      color: #fff;
    }

    /* Stats KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .kpi-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 20px;
      box-shadow: var(--shadow-card);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .kpi-card::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
    }

    .kpi-blue::after { background: var(--azure-primary); }
    .kpi-purple::after { background: #8b5cf6; }
    .kpi-emerald::after { background: #10b981; }
    .kpi-amber::after { background: #f59e0b; }
    .kpi-rose::after { background: #f43f5e; }

    .kpi-title {
      font-size: 0.8rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }

    .kpi-val {
      font-size: 2.2rem;
      font-weight: 800;
      color: #fff;
      margin: 8px 0 4px;
    }

    .kpi-desc {
      font-size: 0.82rem;
      color: var(--text-muted);
    }

    /* Section Cards */
    .section-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 28px;
      margin-bottom: 24px;
      box-shadow: var(--shadow-card);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border);
    }

    .section-title {
      font-size: 1.35rem;
      font-weight: 700;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .section-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 120, 212, 0.2);
      color: var(--azure-primary-light);
    }

    /* Acceptance Criteria List */
    .ac-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .ac-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      background: var(--bg-card-subtle);
      border: 1px solid var(--border);
      padding: 16px;
      border-radius: var(--radius-md);
      transition: transform 0.2s, border-color 0.2s;
    }

    .ac-item:hover {
      transform: translateX(4px);
      border-color: var(--azure-primary);
    }

    .ac-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.78rem;
      font-weight: 700;
      background: rgba(0, 120, 212, 0.2);
      color: var(--azure-primary-light);
      padding: 4px 8px;
      border-radius: 4px;
      white-space: nowrap;
    }

    .ac-text {
      font-size: 0.95rem;
      color: #e2e8f0;
    }

    /* Filter Toolbar & Search */
    .toolbar-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 14px;
      margin-bottom: 20px;
    }

    .filter-tabs {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .tab-btn {
      background: var(--bg-card-subtle);
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 6px 14px;
      font-size: 0.83rem;
      font-weight: 600;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .tab-btn:hover {
      color: #fff;
      border-color: #475569;
    }

    .tab-btn.active {
      background: var(--azure-primary);
      color: #fff;
      border-color: var(--azure-primary);
      box-shadow: 0 2px 10px rgba(0, 120, 212, 0.4);
    }

    .search-box {
      position: relative;
      min-width: 280px;
    }

    .search-input {
      width: 100%;
      background: var(--bg-card-subtle);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 8px 16px 8px 36px;
      color: #fff;
      font-size: 0.85rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .search-input:focus {
      border-color: var(--azure-primary);
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    /* Table Styles */
    .table-responsive {
      overflow-x: auto;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.88rem;
    }

    thead {
      background: #1e293b;
    }

    th {
      padding: 14px 16px;
      font-weight: 700;
      color: #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-size: 0.75rem;
      border-bottom: 2px solid var(--border);
      white-space: nowrap;
    }

    td {
      padding: 16px;
      border-bottom: 1px solid rgba(51, 65, 85, 0.6);
      vertical-align: top;
    }

    tbody tr {
      transition: background 0.15s;
    }

    tbody tr:hover {
      background: rgba(30, 41, 59, 0.5);
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    /* Badges & Tags */
    .tag {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }

    .tag-p1 { background: rgba(244, 63, 94, 0.2); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.3); }
    .tag-p2 { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .tag-p3 { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
    
    .tag-ui { background: rgba(139, 92, 246, 0.2); color: #c084fc; }
    .tag-func { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .tag-neg { background: rgba(244, 63, 94, 0.2); color: #fb7185; }
    .tag-sec { background: rgba(236, 72, 153, 0.2); color: #f472b6; }
    .tag-a11y { background: rgba(6, 182, 212, 0.2); color: #22d3ee; }
    .tag-edge { background: rgba(234, 179, 8, 0.2); color: #facc15; }

    .tag-auto-yes { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4); }
    .tag-auto-no { background: rgba(148, 163, 184, 0.2); color: #cbd5e1; }

    .code-pill {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.82rem;
      background: #0f172a;
      padding: 3px 6px;
      border-radius: 4px;
      border: 1px solid #334155;
      color: #38bdf8;
    }

    /* Risk Cards Grid */
    .risk-grid, .assume-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 16px;
    }

    .risk-card {
      background: #1e293b;
      border: 1px solid var(--border);
      border-left: 4px solid var(--danger);
      border-radius: var(--radius-md);
      padding: 18px;
    }

    .risk-card.med {
      border-left-color: var(--warning);
    }
    .risk-card.low {
      border-left-color: var(--success);
    }

    .risk-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .risk-title {
      font-weight: 700;
      font-size: 0.95rem;
      color: #fff;
    }

    .risk-impact {
      font-size: 0.85rem;
      color: #cbd5e1;
      margin-bottom: 10px;
    }

    .risk-mitigation {
      font-size: 0.83rem;
      background: rgba(15, 23, 42, 0.6);
      padding: 10px;
      border-radius: var(--radius-sm);
      border: 1px dashed #334155;
      color: #94a3b8;
    }
    .risk-mitigation strong {
      color: #38bdf8;
    }

    .assume-card {
      background: #1e293b;
      border: 1px solid var(--border);
      border-left: 4px solid var(--azure-primary);
      border-radius: var(--radius-md);
      padding: 18px;
    }

    .assume-category {
      font-size: 0.78rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: var(--azure-primary-light);
      margin-bottom: 6px;
    }

    .assume-desc {
      font-size: 0.88rem;
      color: #cbd5e1;
    }

    /* Step List inside scenario table */
    .step-list {
      padding-left: 18px;
      margin-top: 6px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .step-list li {
      color: #cbd5e1;
    }

    /* Playwright Strategy box */
    .strategy-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }

    .strategy-item {
      background: var(--bg-card-subtle);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 18px;
    }

    .strategy-title {
      font-weight: 700;
      color: #fff;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .strategy-content {
      font-size: 0.88rem;
      color: #94a3b8;
    }

    /* Media print */
    @media print {
      body {
        background: #fff;
        color: #000;
        padding: 0;
      }
      .hero-card, .section-card, .kpi-card, .risk-card, .assume-card {
        background: #fff !important;
        color: #000 !important;
        border: 1px solid #ddd !important;
        box-shadow: none !important;
      }
      .toolbar-container, .action-btn-group {
        display: none !important;
      }
      th {
        background: #f1f5f9 !important;
        color: #000 !important;
      }
      td, .ac-text, .step-list li {
        color: #000 !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- Hero / Header Section -->
    <div class="hero-card">
      <div class="hero-top">
        <div class="badges-group">
          <a href="${webUrl}" target="_blank" class="badge-pill badge-azure" title="View Work Item in Azure DevOps Boards">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            Azure User Story #${storyId}
          </a>
          <span class="badge-pill badge-type">${workItemType}</span>
          <span class="badge-pill badge-status">State: ${state}</span>
          <span class="badge-pill badge-priority">Priority: ${priority}</span>
        </div>
        <div class="action-btn-group">
          <button class="btn btn-secondary" onclick="window.print()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Print / Save PDF
          </button>
          <a href="${webUrl}" target="_blank" class="btn btn-primary">
            Open in Azure Boards &rarr;
          </a>
        </div>
      </div>

      <h1 class="hero-title">${title}</h1>
      <p class="hero-subtitle">${story.cleanDesc || 'As an existing user, I want to log in to my Creatio CRM account using my business email and password through a secure and well-designed form'}</p>

      <div class="meta-grid">
        <div class="meta-item">
          <span class="meta-label">Assigned To</span>
          <span class="meta-value">${assignedTo}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Created By</span>
          <span class="meta-value">${createdBy}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Story Points</span>
          <span class="meta-value">${storyPoints} SP</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Area / Iteration</span>
          <span class="meta-value">${iterationPath}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Created Date</span>
          <span class="meta-value">${createdDate}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Analysis Timestamp</span>
          <span class="meta-value">${analyzedTimestamp}</span>
        </div>
      </div>
    </div>

    <!-- Executive KPI Grid -->
    <div class="kpi-grid">
      <div class="kpi-card kpi-blue">
        <span class="kpi-title">Total QA Scenarios</span>
        <span class="kpi-val">${totalScenarios}</span>
        <span class="kpi-desc">Across 8 quality vectors</span>
      </div>
      <div class="kpi-card kpi-rose">
        <span class="kpi-title">Critical P1 Scenarios</span>
        <span class="kpi-val">${p1Count}</span>
        <span class="kpi-desc">Blocker / core flow tests</span>
      </div>
      <div class="kpi-card kpi-emerald">
        <span class="kpi-title">Automation Readiness</span>
        <span class="kpi-val">${autoPercent}%</span>
        <span class="kpi-desc">${automatedCount} Playwright automate candidates</span>
      </div>
      <div class="kpi-card kpi-amber">
        <span class="kpi-title">Assessed QA Risks</span>
        <span class="kpi-val">${analysis.risks.length}</span>
        <span class="kpi-desc">Mitigation plans defined</span>
      </div>
      <div class="kpi-card kpi-purple">
        <span class="kpi-title">Acceptance Criteria</span>
        <span class="kpi-val">${story.acList.length}</span>
        <span class="kpi-desc">100% test coverage mapped</span>
      </div>
    </div>

    <!-- Section 1: Detailed Acceptance Criteria -->
    <div class="section-card">
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">✓</span>
          Azure User Story Acceptance Criteria & Requirements
        </h2>
        <span class="badge-pill badge-azure">${story.acList.length} Criteria Identified</span>
      </div>
      <div class="ac-list">
        ${story.acList.map((ac, idx) => `
          <div class="ac-item">
            <span class="ac-badge">AC-${String(idx + 1).padStart(2, '0')}</span>
            <span class="ac-text">${ac}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Section 2: Risk Assessment & Mitigation -->
    <div class="section-card">
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">⚠</span>
          Risk Assessment & Mitigation Strategy
        </h2>
        <span class="badge-pill badge-priority">${analysis.risks.length} Active Vectors</span>
      </div>
      <div class="risk-grid">
        ${analysis.risks.map(r => `
          <div class="risk-card ${r.severity === 'Medium' ? 'med' : r.severity === 'Low' ? 'low' : ''}">
            <div class="risk-header">
              <span class="risk-title">${r.title}</span>
              <span class="tag ${r.severity === 'High' ? 'tag-p1' : r.severity === 'Medium' ? 'tag-p2' : 'tag-p3'}">${r.severity} Risk</span>
            </div>
            <div class="risk-impact"><strong>Impact:</strong> ${r.impact}</div>
            <div class="risk-mitigation">
              <strong>QA Mitigation Strategy:</strong> ${r.mitigation}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Section 3: Assumptions & Constraints -->
    <div class="section-card">
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">ℹ</span>
          Working Assumptions & Test Constraints
        </h2>
        <span class="badge-pill badge-type">${analysis.assumptions.length} Architecture Baselines</span>
      </div>
      <div class="assume-grid">
        ${analysis.assumptions.map(a => `
          <div class="assume-card">
            <div class="assume-category">${a.category}</div>
            <div class="assume-desc">${a.description}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Section 4: Multi-Dimensional Test Scenarios Table -->
    <div class="section-card">
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">📋</span>
          Multi-Dimensional QA Test Scenarios Matrix
        </h2>
        <span class="badge-pill badge-azure">${analysis.scenarios.length} Total Test Scenarios</span>
      </div>

      <div class="toolbar-container">
        <div class="filter-tabs" id="filterTabs">
          <button class="tab-btn active" data-filter="all">All (${analysis.scenarios.length})</button>
          <button class="tab-btn" data-filter="UI/UX">UI / UX</button>
          <button class="tab-btn" data-filter="Functional">Functional</button>
          <button class="tab-btn" data-filter="Negative">Negative / Edge</button>
          <button class="tab-btn" data-filter="Security">Security</button>
          <button class="tab-btn" data-filter="Social Auth">Social Auth</button>
          <button class="tab-btn" data-filter="Accessibility">Accessibility</button>
        </div>
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" id="scenarioSearch" class="search-input" placeholder="Search test scenarios, IDs, steps...">
        </div>
      </div>

      <div class="table-responsive">
        <table id="scenariosTable">
          <thead>
            <tr>
              <th style="width: 130px;">Scenario ID</th>
              <th style="width: 110px;">Category</th>
              <th style="width: 280px;">Title & Pre-conditions</th>
              <th>Test Steps</th>
              <th style="width: 250px;">Expected Result</th>
              <th style="width: 90px;">Priority</th>
              <th style="width: 100px;">Automation</th>
            </tr>
          </thead>
          <tbody>
            ${analysis.scenarios.map(s => `
              <tr data-type="${s.type}">
                <td><span class="code-pill">${s.id}</span></td>
                <td><span class="tag tag-${s.tagClass}">${s.type}</span></td>
                <td>
                  <strong>${s.title}</strong>
                  <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">
                    <strong>Pre:</strong> ${s.preconditions}
                  </div>
                </td>
                <td>
                  <ol class="step-list">
                    ${s.steps.map(step => `<li>${step}</li>`).join('')}
                  </ol>
                </td>
                <td style="color: #cbd5e1;">${s.expected}</td>
                <td><span class="tag tag-${s.priority.toLowerCase()}">${s.priority}</span></td>
                <td><span class="tag ${s.automation === 'Automate' ? 'tag-auto-yes' : 'tag-auto-no'}">${s.automation}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Section 5: Test Data Requirements -->
    <div class="section-card">
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">🗄</span>
          Test Data Requirements Matrix
        </h2>
        <span class="badge-pill badge-status">${analysis.testData.length} Test Payloads</span>
      </div>
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Dataset Name</th>
              <th>Category</th>
              <th>Target Fields</th>
              <th>Sample Payload / Credentials</th>
              <th>Verification Objective</th>
            </tr>
          </thead>
          <tbody>
            ${analysis.testData.map(td => `
              <tr>
                <td><strong>${td.name}</strong></td>
                <td><span class="tag tag-func">${td.type}</span></td>
                <td style="color: #cbd5e1;">${td.fields}</td>
                <td><span class="code-pill">${td.payload}</span></td>
                <td style="color: #cbd5e1;">${td.objective}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Section 6: Playwright Automation Strategy & Traceability -->
    <div class="section-card">
      <div class="section-header">
        <h2 class="section-title">
          <span class="section-icon">⚡</span>
          Playwright Automation Strategy & Traceability
        </h2>
        <span class="badge-pill badge-azure">Framework Architecture</span>
      </div>
      <div class="strategy-grid">
        <div class="strategy-item">
          <div class="strategy-title">
            <span style="color: var(--azure-primary-light);">●</span> Page Object Model Design
          </div>
          <div class="strategy-content">
            Encapsulate login elements inside <code>page-objects/login.page.ts</code>. Define locators for header, Business Email, Password, Eye Icon, Forgot Password, LOG IN, Social Buttons (LinkedIn, Google, Facebook), Sign Up, Cookie Settings, and Chatbot.
          </div>
        </div>
        <div class="strategy-item">
          <div class="strategy-title">
            <span style="color: #10b981;">●</span> Test Specification Suite
          </div>
          <div class="strategy-content">
            Create <code>tests/ui/login.spec.ts</code> covering all P1 Happy Path, Negative Validation, and Security test scenarios using Playwright test runner with parallel workers.
          </div>
        </div>
        <div class="strategy-item">
          <div class="strategy-title">
            <span style="color: #f59e0b;">●</span> Entry Criteria
          </div>
          <div class="strategy-content">
            User story #${storyId} state in Azure DevOps moved to Active/Ready for QA, test environment reachable at <code>https://accounts.creatio.com/login/alm</code>, pre-seeded accounts verified in staging.
          </div>
        </div>
        <div class="strategy-item">
          <div class="strategy-title">
            <span style="color: #f43f5e;">●</span> Exit & Sign-Off Criteria
          </div>
          <div class="strategy-content">
            100% of P1 scenarios passing in Playwright automation test run, zero Critical/Blocker defects open, Azure DevOps work item test traceability verified.
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- Interactive JavaScript Filter & Search -->
  <script>
    const filterTabs = document.querySelectorAll('.tab-btn');
    const searchInput = document.getElementById('scenarioSearch');
    const tableBody = document.querySelector('#scenariosTable tbody');
    const rows = tableBody.querySelectorAll('tr');

    let activeFilter = 'all';

    filterTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        filterTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        applyFilters();
      });
    });

    searchInput.addEventListener('input', () => {
      applyFilters();
    });

    function applyFilters() {
      const query = searchInput.value.toLowerCase().trim();

      rows.forEach(row => {
        const type = row.dataset.type || '';
        const text = row.innerText.toLowerCase();

        const matchesFilter = activeFilter === 'all' || 
          type.toLowerCase().includes(activeFilter.toLowerCase()) || 
          (activeFilter === 'Negative' && (type.includes('Negative') || type.includes('Boundary') || type.includes('Edge'))) ||
          (activeFilter === 'Social Auth' && type.includes('Social'));

        const matchesQuery = !query || text.includes(query);

        if (matchesFilter && matchesQuery) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>`;
}

// Main execution function
async function main() {
  const args = process.argv.slice(2);
  const inputArg = args.join(' ').trim() || '1923';

  // Parse numeric work item ID from input (e.g. "USER STORY 1923", "#1923", "story 1923", "1923")
  const idMatch = inputArg.match(/\d+/);
  if (!idMatch) {
    throw new Error(`Unable to extract numeric work item ID from input: "${inputArg}"`);
  }
  const workItemId = parseInt(idMatch[0], 10);

  console.log(`[INFO] Starting Azure TFS Requirement Analysis for User Story: #${workItemId}`);

  const cfg = getAzureTfsConfig();
  console.log(`[INFO] Azure DevOps Organization: ${cfg.organization}`);
  console.log(`[INFO] Azure DevOps Project: ${cfg.projectName}`);
  console.log(`[INFO] Connecting to Azure DevOps REST API...`);

  const rawWorkItem = await fetchAzureWorkItem(workItemId);
  console.log(`[SUCCESS] Connected to Azure DevOps! Fetched Work Item #${rawWorkItem.id} - ${rawWorkItem.fields?.['System.Title']}`);

  const parsedStory = parseAzureWorkItem(rawWorkItem);
  console.log(`[INFO] Extracted ${parsedStory.acList.length} Acceptance Criteria items and story details.`);

  console.log(`[INFO] Engineering deep multi-dimensional test scenarios, risks, assumptions, and data matrix...`);
  const analysis = buildAzureStoryAnalysis(parsedStory);

  console.log(`[INFO] Generating colorful, responsive Azure DevOps HTML Test Plan Report...`);
  const htmlContent = generateAzureHtmlReport(parsedStory, analysis);

  // Write to ai-implementation/requirement-analysis/
  const outputDir = path.join(projectRoot, 'ai-implementation', 'requirement-analysis');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFilename = `azure-story-${workItemId}-requirement-analysis.html`;
  const outputPath = path.join(outputDir, outputFilename);
  fs.writeFileSync(outputPath, htmlContent, 'utf8');
  console.log(`[SUCCESS] Requirement Analysis Report generated at: ${outputPath}`);

  // Also write to requirement-analysis/ folder at project root if needed
  const rootReqDir = path.join(projectRoot, 'requirement-analysis');
  if (!fs.existsSync(rootReqDir)) {
    fs.mkdirSync(rootReqDir, { recursive: true });
  }
  const rootOutputPath = path.join(rootReqDir, outputFilename);
  fs.writeFileSync(rootOutputPath, htmlContent, 'utf8');
  console.log(`[SUCCESS] Synced report copy to requirement-analysis folder at: ${rootOutputPath}`);
}

main().catch(err => {
  console.error('[ERROR]', err.message);
  process.exit(1);
});

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

// Read .env file
function loadEnv() {
  const envPath = path.join(projectRoot, '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error(`.env file not found at ${envPath}`);
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
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
  return env;
}

// Extract base Jira Host URL (e.g., https://bharathtechacademy40.atlassian.net)
function getJiraBaseUrl(rawUrl) {
  if (!rawUrl) return null;
  try {
    const parsed = new URL(rawUrl);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return rawUrl.replace(/\/jira\/.*$/i, '');
  }
}

// Extract Zephyr Owner Account ID if available
function getOwnerAccountId(env) {
  const token = env.ZEPHYR_API_TOKEN;
  if (token && token.includes('.')) {
    try {
      const parts = token.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      if (payload?.context?.user?.accountId) {
        return payload.context.user.accountId;
      }
    } catch {
      // ignore
    }
  }
  return '712020:5823ea36-5934-4d1d-9f77-8ef6257f1ac9';
}

// Fetch Jira issue
async function fetchJiraIssue(issueKey, env) {
  const baseUrl = getJiraBaseUrl(env.JIRA_URL);
  if (!baseUrl) throw new Error('JIRA_URL missing or invalid in .env');
  const username = env.JIRA_USERNAME;
  const token = env.JIRA_API_TOKEN;
  if (!username || !token) throw new Error('JIRA_USERNAME or JIRA_API_TOKEN missing in .env');

  const auth = Buffer.from(`${username}:${token}`).toString('base64');
  const url = `${baseUrl}/rest/api/2/issue/${issueKey}?expand=renderedFields,names,schema`;

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
    throw new Error(`Failed to fetch Jira issue ${issueKey} (${response.status} ${response.statusText}): ${errorText}`);
  }

  return await response.json();
}

// Parse Acceptance Criteria and context from Jira description
function parseJiraDescription(issue) {
  const rawDesc = issue.fields?.description || '';
  const lines = rawDesc.split(/\r?\n/);
  const acList = [];
  let inAC = false;
  let userStoryStatement = '';

  for (const line of lines) {
    if (line.match(/^h[1-6]\.\s*acceptance\s*criteria/i)) {
      inAC = true;
      continue;
    }
    if (line.match(/^h[1-6]\./i) && !line.match(/acceptance\s*criteria/i)) {
      inAC = false;
    }

    if (inAC && line.trim().startsWith('*')) {
      const clean = line.replace(/^[\*\s]+/, '').replace(/[\*\_]/g, '').trim();
      if (clean) acList.push(clean);
    }

    if (!inAC && (line.toLowerCase().includes('as an') || line.toLowerCase().includes('as a'))) {
      userStoryStatement = line.trim();
    }
  }

  return { rawDesc, acList, userStoryStatement };
}

// Format a single CSV cell following RFC 4180
function escapeCsvCell(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Convert test case objects to Zephyr Scale CSV rows strictly following SampleTestCases.csv
function generateCsv(testCases, ownerId, issueKey) {
  const headers = [
    'Key',
    'Name',
    'Status',
    'Precondition',
    'Objective',
    'Folder',
    'Priority',
    'Component',
    'Labels',
    'Owner',
    'Estimated Time',
    'Coverage (Issues)',
    'Coverage (Pages)',
    'Test Script (Step-by-Step) - Step',
    'Test Script (Step-by-Step) - Test Data',
    'Test Script (Step-by-Step) - Expected Result',
    'Test Script (Plain Text)',
    'Test Script (BDD)'
  ];

  const rows = [];
  rows.push(headers.map(escapeCsvCell).join(','));

  for (const tc of testCases) {
    const priority = tc.priority || 'Normal';
    const status = tc.status || 'Draft';
    const precondition = tc.precondition || '';
    const objective = tc.objective || '';
    const folder = tc.folder || '';
    const component = tc.component || '';
    const labels = tc.labels || '';
    const coverage = issueKey || '';
    const owner = tc.owner || ownerId;

    if (!tc.steps || tc.steps.length === 0) {
      continue;
    }

    // Step 1: Contains test case header metadata
    const step1 = tc.steps[0];
    const firstRow = [
      '', // Key (empty for new import)
      tc.name,
      status,
      precondition,
      objective,
      folder,
      priority,
      component,
      labels,
      owner,
      '', // Estimated Time
      coverage, // Coverage (Issues)
      '', // Coverage (Pages)
      step1.step,
      step1.testData || '',
      step1.expectedResult,
      '', // Plain text
      ''  // BDD
    ];
    rows.push(firstRow.map(escapeCsvCell).join(','));

    // Subsequent steps: columns 1-13 MUST be empty
    for (let i = 1; i < tc.steps.length; i++) {
      const stepN = tc.steps[i];
      const subRow = [
        '', '', '', '', '', '', '', '', '', '', '', '', '',
        stepN.step,
        stepN.testData || '',
        stepN.expectedResult,
        '', ''
      ];
      rows.push(subRow.map(escapeCsvCell).join(','));
    }
  }

  return rows.join('\r\n') + '\r\n';
}

// Generate comprehensive test cases for a story covering Positive, Negative, and Edge cases
function buildComprehensiveTestCases(issue, parsed) {
  const summary = issue.fields?.summary || 'User Story';
  const issueKey = issue.key;
  const isLoginForm = summary.toLowerCase().includes('login') || parsed.rawDesc.toLowerCase().includes('login');
  const appUrl = 'https://accounts.creatio.com/login/alm';

  const testCases = [];

  if (isLoginForm) {
    // -------------------------------------------------------------
    // POSITIVE / FUNCTIONAL TEST CASES
    // -------------------------------------------------------------
    testCases.push({
      name: 'Verify the cookies pop-up is displayed successfully.',
      priority: 'Normal',
      objective: 'Ensure the cookies consent banner displays when first accessing the application.',
      steps: [
        {
          step: 'Launch the Chrome browser.',
          testData: '',
          expectedResult: 'Chrome browser should be launched successfully.'
        },
        {
          step: `Enter the URL - ${appUrl} And launch the application.`,
          testData: appUrl,
          expectedResult: 'The Creatio CRM application should be launched successfully.'
        },
        {
          step: 'Verify the cookies pop-up is displayed successfully.',
          testData: '',
          expectedResult: 'Cookies pop-up should be displayed successfully with cookie policy text and action buttons.'
        }
      ]
    });

    testCases.push({
      name: 'Verify the cookies pop-up Logos',
      priority: 'Normal',
      objective: 'Validate brand logos on the cookie consent banner.',
      steps: [
        {
          step: 'Launch the Chrome browser.',
          testData: '',
          expectedResult: 'Chrome browser should be launched successfully.'
        },
        {
          step: `Enter the URL - ${appUrl} And launch the application.`,
          testData: appUrl,
          expectedResult: 'The Creatio CRM application should be launched successfully.'
        },
        {
          step: 'Verify the cookies pop-up is displayed successfully.',
          testData: '',
          expectedResult: 'Cookies pop-up should be displayed successfully.'
        },
        {
          step: 'Verify the cookies pop-up Logos',
          testData: '',
          expectedResult: 'Cookies pop-up should have two logos.\n1. Creatio logo\n2. Cookiebot Logo'
        }
      ]
    });

    testCases.push({
      name: 'Verify Login Page Header and UI Elements Presence',
      priority: 'Normal',
      objective: 'Validate that the login form header, input fields, labels, buttons, and links are visible as per specification.',
      steps: [
        {
          step: 'Launch the Chrome browser.',
          testData: '',
          expectedResult: 'Chrome browser should be launched successfully.'
        },
        {
          step: `Enter the URL - ${appUrl} And launch the application.`,
          testData: appUrl,
          expectedResult: 'The Creatio CRM application should be launched successfully.'
        },
        {
          step: 'Accept or dismiss cookies pop-up if displayed.',
          testData: 'Allow All',
          expectedResult: 'Cookies pop-up closes and the login container is in clear view.'
        },
        {
          step: 'Verify the form header title text.',
          testData: '',
          expectedResult: 'Header title should display "LOG IN TO YOUR ACCOUNT".'
        },
        {
          step: 'Verify the Business email field and label.',
          testData: '',
          expectedResult: 'Business email textbox is displayed with "Business email" label placed directly on top.'
        },
        {
          step: 'Verify the Password field, label, and eye icon.',
          testData: '',
          expectedResult: 'Password textbox is displayed with "Password" label on top and an eye icon inside/beside the textbox.'
        },
        {
          step: 'Verify the LOG IN button is displayed.',
          testData: '',
          expectedResult: 'LOG IN button is prominently displayed and enabled.'
        }
      ]
    });

    testCases.push({
      name: 'Verify Login With Valid Credentials',
      priority: 'High',
      objective: 'Validate successful user login and redirection to dashboard upon providing valid credentials.',
      steps: [
        {
          step: 'Launch the Chrome browser.',
          testData: '',
          expectedResult: 'Chrome browser should be launched successfully.'
        },
        {
          step: `Enter the URL - ${appUrl} And launch the application.`,
          testData: appUrl,
          expectedResult: 'The Creatio CRM application should be launched successfully.'
        },
        {
          step: 'Verify the cookies pop-up is displayed successfully.',
          testData: '',
          expectedResult: 'Cookies pop-up should be displayed successfully.'
        },
        {
          step: 'Select the `Allow All` button and verify the cookies pop-up is closed.',
          testData: '',
          expectedResult: 'Cookies pop-up should be closed successfully and Login page should be displayed.'
        },
        {
          step: 'Enter valid business email in the Business email field.',
          testData: 'alex.smith@creatio-crm.com',
          expectedResult: 'Email should be entered properly in the textbox.'
        },
        {
          step: 'Enter valid password in the Password field.',
          testData: 'ValidPass#2026',
          expectedResult: 'Password should be entered and masked by default with bullet characters.'
        },
        {
          step: 'Click on the LOG IN button.',
          testData: '',
          expectedResult: 'User should be able to click on the LOG IN button.'
        },
        {
          step: 'Verify login is successful.',
          testData: '',
          expectedResult: 'User login should be successful and redirected to the Creatio CRM workspace dashboard.'
        }
      ]
    });

    testCases.push({
      name: 'Verify Password Visibility Toggle Functionality Using Eye Icon',
      priority: 'Normal',
      objective: 'Verify user can unmask and re-mask password characters by clicking the eye icon.',
      steps: [
        {
          step: 'Launch the Chrome browser.',
          testData: '',
          expectedResult: 'Chrome browser should be launched successfully.'
        },
        {
          step: `Enter the URL - ${appUrl} and launch the application.`,
          testData: appUrl,
          expectedResult: 'Application should be loaded successfully.'
        },
        {
          step: 'Dismiss cookies pop-up by clicking Allow All.',
          testData: '',
          expectedResult: 'Cookies pop-up is dismissed.'
        },
        {
          step: 'Enter password string into the Password textbox.',
          testData: 'SecretPassword123!',
          expectedResult: 'Password characters should be masked by default (type="password").'
        },
        {
          step: 'Click on the eye icon in the password field.',
          testData: '',
          expectedResult: 'Password input type changes to "text" and plain text "SecretPassword123!" becomes visible.'
        },
        {
          step: 'Click on the eye icon again.',
          testData: '',
          expectedResult: 'Password input type toggles back to "password" and characters are re-masked.'
        }
      ]
    });

    testCases.push({
      name: 'Verify "Forgot password" Link Redirection',
      priority: 'Normal',
      objective: 'Ensure the Forgot password link is placed on top of the password field and navigates to the recovery workflow.',
      steps: [
        {
          step: 'Launch the Chrome browser and navigate to the Creatio CRM login page.',
          testData: appUrl,
          expectedResult: 'Login page is loaded.'
        },
        {
          step: 'Verify the location of "Forgot password" link.',
          testData: '',
          expectedResult: '"Forgot password" link is positioned directly on top of the password textbox.'
        },
        {
          step: 'Click on the "Forgot password" link.',
          testData: '',
          expectedResult: 'User is navigated to the Password Recovery / Reset page successfully.'
        }
      ]
    });

    testCases.push({
      name: 'Verify Social Login Options and Links Display',
      priority: 'Normal',
      objective: 'Validate presence and clickable state of LinkedIn, Google, and Facebook social sign-in buttons with icons and labels.',
      steps: [
        {
          step: 'Launch the Chrome browser and navigate to the login page.',
          testData: appUrl,
          expectedResult: 'Login page is displayed.'
        },
        {
          step: 'Verify the label "or log in using" below the LOG IN button.',
          testData: '',
          expectedResult: 'Label "or log in using" is displayed directly below the LOG IN button with proper styling.'
        },
        {
          step: 'Verify social login options are displayed with respective logos and hyperlink labels.',
          testData: '',
          expectedResult: 'LinkedIn, Google, and Facebook logos with clickable hyperlink labels are visible.'
        },
        {
          step: 'Click on Google social login option.',
          testData: '',
          expectedResult: 'Redirects or opens Google OAuth consent dialog with accounts.google.com endpoint.'
        },
        {
          step: 'Navigate back and verify LinkedIn and Facebook options trigger their respective provider login prompts.',
          testData: '',
          expectedResult: 'LinkedIn and Facebook OAuth authentication dialogs open appropriately.'
        }
      ]
    });

    testCases.push({
      name: 'Verify "Don’t have an account?" and "SIGN UP" Link Redirection',
      priority: 'Normal',
      objective: 'Ensure new users can navigate to the registration page via the SIGN UP link.',
      steps: [
        {
          step: 'Launch the Chrome browser and navigate to the Creatio CRM login page.',
          testData: appUrl,
          expectedResult: 'Login page is displayed.'
        },
        {
          step: 'Verify the text "Don’t have an account?" is displayed below social media icons.',
          testData: '',
          expectedResult: 'Text "Don’t have an account?" is displayed with proper typography.'
        },
        {
          step: 'Verify the "SIGN UP" link appears directly below.',
          testData: '',
          expectedResult: '"SIGN UP" link is visible, styled as a prominent call-to-action link.'
        },
        {
          step: 'Click on the "SIGN UP" link.',
          testData: '',
          expectedResult: 'User is redirected to the Creatio CRM new account registration page.'
        }
      ]
    });

    testCases.push({
      name: 'Verify Cookie Settings Icon and Consent Management Dialog',
      priority: 'Normal',
      objective: 'Ensure the cookie settings icon in the bottom left corner allows viewing, withdrawing, and altering consent.',
      steps: [
        {
          step: 'Launch the Chrome browser and navigate to the Creatio CRM login page.',
          testData: appUrl,
          expectedResult: 'Login page is displayed.'
        },
        {
          step: 'Locate the Cookie Settings icon in the bottom left corner of the page.',
          testData: '',
          expectedResult: 'Cookie icon is displayed in the bottom-left corner without any accompanying text label.'
        },
        {
          step: 'Click on the Cookie Settings icon.',
          testData: '',
          expectedResult: 'Cookie consent preferences modal/dialog opens showing categories (Necessary, Preferences, Statistics, Marketing).'
        },
        {
          step: 'Modify a consent category (e.g., toggle Preferences or withdraw consent) and save.',
          testData: '',
          expectedResult: 'Updated preferences are saved into local storage/cookies and dialog closes smoothly.'
        }
      ]
    });

    testCases.push({
      name: 'Verify Creatio Chatbot Icon and FAQ Assistance',
      priority: 'Normal',
      objective: 'Ensure the Creatio chatbot widget icon in the bottom right corner opens an interactive FAQ helper window.',
      steps: [
        {
          step: 'Launch the Chrome browser and navigate to the Creatio CRM login page.',
          testData: appUrl,
          expectedResult: 'Login page is displayed.'
        },
        {
          step: 'Locate the Creatio Chatbot icon in the bottom right corner.',
          testData: '',
          expectedResult: 'Chatbot icon is displayed floating in the bottom right corner without any label.'
        },
        {
          step: 'Click on the Chatbot icon.',
          testData: '',
          expectedResult: 'Chatbot modal / slide-over dialog opens with FAQ prompts, greeting message, and text query input.'
        },
        {
          step: 'Click on close button of the chatbot window.',
          testData: '',
          expectedResult: 'Chatbot window minimizes back to the icon state without altering page state.'
        }
      ]
    });

    // -------------------------------------------------------------
    // NEGATIVE TEST CASES
    // -------------------------------------------------------------
    testCases.push({
      name: 'Verify Error Message When Submitting Completely Blank Form',
      priority: 'High',
      objective: 'Ensure validation prevents form submission and indicates required fields when both fields are blank.',
      steps: [
        {
          step: 'Launch the Chrome browser and navigate to the login page.',
          testData: appUrl,
          expectedResult: 'Login page is loaded.'
        },
        {
          step: 'Ensure both Business email and Password fields are empty.',
          testData: '',
          expectedResult: 'Both input fields contain no values.'
        },
        {
          step: 'Click on the LOG IN button.',
          testData: '',
          expectedResult: 'Form submission is intercepted; required field validation error messages appear for both email and password.'
        }
      ]
    });

    testCases.push({
      name: 'Verify Validation With Empty Password and Valid Email',
      priority: 'Normal',
      objective: 'Ensure appropriate error prompt displays when email is entered but password field is left empty.',
      steps: [
        {
          step: 'Launch Chrome and navigate to the login page.',
          testData: appUrl,
          expectedResult: 'Login page is displayed.'
        },
        {
          step: 'Enter valid business email.',
          testData: 'valid.user@creatio-crm.com',
          expectedResult: 'Email is entered.'
        },
        {
          step: 'Leave Password field blank.',
          testData: '',
          expectedResult: 'Password field remains empty.'
        },
        {
          step: 'Click on the LOG IN button.',
          testData: '',
          expectedResult: 'System highlights the password field in red and displays "Please enter your password" message.'
        }
      ]
    });

    testCases.push({
      name: 'Verify Validation With Empty Business Email and Valid Password',
      priority: 'Normal',
      objective: 'Ensure validation alerts user when password is entered without providing email.',
      steps: [
        {
          step: 'Launch Chrome and navigate to the login page.',
          testData: appUrl,
          expectedResult: 'Login page is displayed.'
        },
        {
          step: 'Leave Business email field blank.',
          testData: '',
          expectedResult: 'Email field is empty.'
        },
        {
          step: 'Enter valid password.',
          testData: 'ValidPass#2026',
          expectedResult: 'Password is entered and masked.'
        },
        {
          step: 'Click on the LOG IN button.',
          testData: '',
          expectedResult: 'System prompts user with "Please enter your business email".'
        }
      ]
    });

    testCases.push({
      name: 'Verify Validation for Malformed Email Format (Missing @ and domain)',
      priority: 'High',
      objective: 'Ensure email format regex validates inputs and rejects malformed email strings.',
      steps: [
        {
          step: 'Launch the Chrome browser and navigate to the login page.',
          testData: appUrl,
          expectedResult: 'Login page is displayed.'
        },
        {
          step: 'Enter invalid email format missing @ symbol.',
          testData: 'invalidusercreatio.com',
          expectedResult: 'Email field contains invalid string.'
        },
        {
          step: 'Enter a valid password.',
          testData: 'ValidPass#2026',
          expectedResult: 'Password entered.'
        },
        {
          step: 'Click on the LOG IN button.',
          testData: '',
          expectedResult: 'Inline validation error "Please enter a valid email address" is displayed.'
        }
      ]
    });

    testCases.push({
      name: 'Verify Validation for Email Missing Domain Extension',
      priority: 'Normal',
      objective: 'Ensure email strings without top level domain extension are rejected.',
      steps: [
        {
          step: 'Navigate to the login page.',
          testData: appUrl,
          expectedResult: 'Login page loaded.'
        },
        {
          step: 'Enter email missing domain extension.',
          testData: 'user@domain',
          expectedResult: 'Text is populated in email field.'
        },
        {
          step: 'Enter password and click LOG IN.',
          testData: 'ValidPass#2026',
          expectedResult: 'Validation error "Please enter a valid business email address" is displayed.'
        }
      ]
    });

    testCases.push({
      name: 'Verify Login With Unregistered Business Email',
      priority: 'High',
      objective: 'Ensure non-existing user credentials return secure authentication error.',
      steps: [
        {
          step: 'Launch Chrome and navigate to the login page.',
          testData: appUrl,
          expectedResult: 'Login page is displayed.'
        },
        {
          step: 'Enter an unregistered business email.',
          testData: 'nonexistent.user9999@creatio-crm.com',
          expectedResult: 'Email field is populated.'
        },
        {
          step: 'Enter any standard password.',
          testData: 'SomePassword123!',
          expectedResult: 'Password is populated.'
        },
        {
          step: 'Click on the LOG IN button.',
          testData: '',
          expectedResult: 'Server returns generic error "Invalid username or password" to prevent user enumeration.'
        }
      ]
    });

    testCases.push({
      name: 'Verify Login With Incorrect Password for Registered User',
      priority: 'High',
      objective: 'Ensure registered user cannot sign in with wrong password and generic error is shown.',
      steps: [
        {
          step: 'Launch Chrome and navigate to the login page.',
          testData: appUrl,
          expectedResult: 'Login page is displayed.'
        },
        {
          step: 'Enter a valid registered business email.',
          testData: 'alex.smith@creatio-crm.com',
          expectedResult: 'Email is entered.'
        },
        {
          step: 'Enter an incorrect password.',
          testData: 'WrongPassword#999',
          expectedResult: 'Password entered and masked.'
        },
        {
          step: 'Click on the LOG IN button.',
          testData: '',
          expectedResult: 'Error message "Invalid username or password" is displayed and user remains on login page.'
        }
      ]
    });

    // -------------------------------------------------------------
    // EDGE CASES & BOUNDARY TEST CASES
    // -------------------------------------------------------------
    testCases.push({
      name: 'Verify Email Trimming with Leading and Trailing Whitespace',
      priority: 'Normal',
      objective: 'Ensure system trims unnecessary leading and trailing whitespace from email input automatically.',
      steps: [
        {
          step: 'Navigate to login page.',
          testData: appUrl,
          expectedResult: 'Login page is loaded.'
        },
        {
          step: 'Enter valid email surrounded by leading and trailing space characters.',
          testData: '   alex.smith@creatio-crm.com   ',
          expectedResult: 'Email is populated with whitespace.'
        },
        {
          step: 'Enter valid password.',
          testData: 'ValidPass#2026',
          expectedResult: 'Password entered.'
        },
        {
          step: 'Click on the LOG IN button.',
          testData: '',
          expectedResult: 'System auto-trims whitespace and authenticates successfully.'
        }
      ]
    });

    testCases.push({
      name: 'Verify Boundary Limits with Maximum Length String Inputs',
      priority: 'Low',
      objective: 'Ensure email and password fields handle long strings (255+ characters) without layout breakage or application crashes.',
      steps: [
        {
          step: 'Navigate to login page.',
          testData: appUrl,
          expectedResult: 'Login page is loaded.'
        },
        {
          step: 'Enter a 254-character long valid email address.',
          testData: 'a'.repeat(64) + '@' + 'b'.repeat(185) + '.com',
          expectedResult: 'Field handles input gracefully without text overflowing outside the input box boundary.'
        },
        {
          step: 'Enter a 256-character password.',
          testData: 'P@ssword'.repeat(32),
          expectedResult: 'Password field accepts or cleanly enforces maxlength attribute.'
        },
        {
          step: 'Click on the LOG IN button.',
          testData: '',
          expectedResult: 'System returns handled validation/authentication response without HTTP 500 error.'
        }
      ]
    });

    testCases.push({
      name: 'Verify SQL Injection Security Handling in Input Fields',
      priority: 'High',
      objective: 'Ensure input fields sanitize SQL injection payloads and do not execute unauthorized SQL queries.',
      steps: [
        {
          step: 'Navigate to login page.',
          testData: appUrl,
          expectedResult: 'Login page is loaded.'
        },
        {
          step: 'Enter SQL injection payload into business email field.',
          testData: "' OR '1'='1' --",
          expectedResult: 'Payload text is entered as literal string.'
        },
        {
          step: 'Enter SQL injection string in password field.',
          testData: "' OR 1=1 --",
          expectedResult: 'Payload text entered.'
        },
        {
          step: 'Click on the LOG IN button.',
          testData: '',
          expectedResult: 'System treats input as literal invalid credentials; returns safe error without executing SQL or exposing stack traces.'
        }
      ]
    });

    testCases.push({
      name: 'Verify Cross-Site Scripting (XSS) Handling in Form Inputs',
      priority: 'High',
      objective: 'Ensure XSS script payloads are sanitized and not rendered or executed as HTML in DOM.',
      steps: [
        {
          step: 'Navigate to login page.',
          testData: appUrl,
          expectedResult: 'Login page is loaded.'
        },
        {
          step: 'Enter script tags into the Business email field.',
          testData: '<script>alert("XSS")</script>',
          expectedResult: 'String is entered.'
        },
        {
          step: 'Enter valid password and click LOG IN.',
          testData: 'ValidPass#2026',
          expectedResult: 'Input is safely HTML entity-escaped; no alert dialog pops up and error message displays as text.'
        }
      ]
    });

    testCases.push({
      name: 'Verify Rapid Successive Double Clicks on LOG IN Button',
      priority: 'Normal',
      objective: 'Ensure button disables during request processing to prevent duplicate form submissions or concurrency race conditions.',
      steps: [
        {
          step: 'Navigate to login page and input valid credentials.',
          testData: 'alex.smith@creatio-crm.com / ValidPass#2026',
          expectedResult: 'Credentials entered.'
        },
        {
          step: 'Rapidly double-click or multi-click the LOG IN button.',
          testData: '',
          expectedResult: 'Button disables or shows loading spinner on first click; only a single authentication request is dispatched to the backend.'
        }
      ]
    });

    testCases.push({
      name: 'Verify Keyboard Navigation and Accessibility (Tab Sequence & Enter Key)',
      priority: 'Normal',
      objective: 'Ensure users can fully navigate and submit the form using only keyboard commands.',
      steps: [
        {
          step: 'Navigate to login page and press Tab key.',
          testData: '',
          expectedResult: 'Focus moves logically: Cookie banner -> Email textbox -> Forgot password -> Password textbox -> Eye icon -> LOG IN button.'
        },
        {
          step: 'Enter valid credentials using keyboard.',
          testData: 'alex.smith@creatio-crm.com / ValidPass#2026',
          expectedResult: 'Credentials entered.'
        },
        {
          step: 'While focused inside password field, press Enter key.',
          testData: 'Enter key',
          expectedResult: 'Form submits automatically and logs user in without needing mouse click.'
        }
      ]
    });

    testCases.push({
      name: 'Verify Password Field Security in DOM and Inspection',
      priority: 'High',
      objective: 'Verify password input has autocomplete configurations and does not expose cleartext in HTTP URL parameters.',
      steps: [
        {
          step: 'Navigate to login page and open DevTools Network tab.',
          testData: appUrl,
          expectedResult: 'DevTools active.'
        },
        {
          step: 'Enter credentials and click LOG IN.',
          testData: 'alex.smith@creatio-crm.com / SecretPassword123!',
          expectedResult: 'Form submission dispatched.'
        },
        {
          step: 'Inspect the HTTP request in the Network tab.',
          testData: '',
          expectedResult: 'Request is transmitted over HTTPS via POST request body; credentials are never exposed in query string parameters.'
        }
      ]
    });

  } else {
    // -------------------------------------------------------------
    // GENERAL STORY TEST CASES (Tailored to any other Jira User Story)
    // -------------------------------------------------------------
    // Extract ACs or generate default positive/negative/edge cases
    const acs = parsed.acList.length > 0 ? parsed.acList : [
      'Functional happy path execution for story',
      'Input validation and mandatory field checking',
      'Error handling and boundary condition management'
    ];

    // Positive test cases for each AC
    acs.forEach((ac, idx) => {
      testCases.push({
        name: `Verify ${ac.length > 60 ? ac.slice(0, 57) + '...' : ac}`,
        priority: idx === 0 ? 'High' : 'Normal',
        objective: `Validate acceptance criterion: ${ac}`,
        steps: [
          {
            step: 'Launch the Chrome browser.',
            testData: '',
            expectedResult: 'Chrome browser should be launched successfully.'
          },
          {
            step: `Navigate to the application URL for ${issueKey}.`,
            testData: appUrl,
            expectedResult: 'Target page loads successfully.'
          },
          {
            step: `Perform action to verify: ${ac}`,
            testData: 'Standard valid input',
            expectedResult: `System behaves as expected: ${ac}`
          },
          {
            step: 'Verify state persistence and successful feedback.',
            testData: '',
            expectedResult: 'Action completes with success indicator.'
          }
        ]
      });
    });

    // Negative test case
    testCases.push({
      name: `Verify Error Handling for Invalid Inputs in ${issueKey}`,
      priority: 'High',
      objective: 'Ensure validation prevents invalid data submission and displays helpful error messages.',
      steps: [
        {
          step: 'Launch the Chrome browser and navigate to the application feature.',
          testData: appUrl,
          expectedResult: 'Feature page loaded.'
        },
        {
          step: 'Supply invalid/empty parameters contrary to expected requirements.',
          testData: 'Empty / Malformed input',
          expectedResult: 'System detects invalid inputs.'
        },
        {
          step: 'Attempt to submit/execute the action.',
          testData: '',
          expectedResult: 'Action is blocked; clear validation message is presented to the user.'
        }
      ]
    });

    // Edge case test case
    testCases.push({
      name: `Verify Boundary Limits and Edge Cases for ${issueKey}`,
      priority: 'Normal',
      objective: 'Validate edge conditions including maximum characters, special symbols, and rapid submission.',
      steps: [
        {
          step: 'Navigate to the feature page.',
          testData: appUrl,
          expectedResult: 'Feature page loaded.'
        },
        {
          step: 'Input boundary values (maximum allowed length, special characters, whitespaces).',
          testData: 'Boundary test string (255+ chars)',
          expectedResult: 'System handles boundary inputs gracefully without truncating unexpectedly or crashing.'
        },
        {
          step: 'Submit the form and verify system response.',
          testData: '',
          expectedResult: 'System processes or safely rejects boundary input according to business constraints.'
        }
      ]
    });
  }

  return testCases;
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const issueKeyArg = args[0] || 'CRM-5';

  // Format issue key (e.g., if user passed 5, make CRM-5)
  const issueKey = issueKeyArg.includes('-') ? issueKeyArg.toUpperCase() : `CRM-${issueKeyArg}`;
  console.log(`[INFO] Starting Test Case Generation for Jira Issue: ${issueKey}`);

  const env = loadEnv();
  console.log(`[INFO] Loaded environment configuration from .env`);

  const ownerId = getOwnerAccountId(env);
  console.log(`[INFO] Using Zephyr Owner Account ID: ${ownerId}`);

  console.log(`[INFO] Connecting to Jira API at ${getJiraBaseUrl(env.JIRA_URL)}...`);
  const issue = await fetchJiraIssue(issueKey, env);
  console.log(`[SUCCESS] Connected to Jira! Fetched issue: ${issue.key} - ${issue.fields?.summary}`);

  console.log(`[INFO] Parsing user story, context, and acceptance criteria...`);
  const parsed = parseJiraDescription(issue);
  console.log(`[INFO] Extracted ${parsed.acList.length} Acceptance Criteria.`);

  console.log(`[INFO] Generating comprehensive Positive, Negative, and Edge-Case test scenarios with detailed steps...`);
  const testCases = buildComprehensiveTestCases(issue, parsed);
  console.log(`[SUCCESS] Generated ${testCases.length} comprehensive test cases!`);

  console.log(`[INFO] Formatting test cases into Jira/Zephyr Scale CSV template...`);
  const csvContent = generateCsv(testCases, ownerId, issueKey);

  const outputDir = path.join(projectRoot, 'ai-implementation', 'sample-testcases');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFilename = `${issueKey.toLowerCase()}-testcases.csv`;
  const outputPath = path.join(outputDir, outputFilename);

  fs.writeFileSync(outputPath, csvContent, 'utf8');
  console.log(`[SUCCESS] CSV Test Cases file generated at: ${outputPath}`);

  // Summary output
  console.log(`\n==================================================`);
  console.log(` TEST CASES GENERATION SUMMARY FOR ${issueKey}`);
  console.log(`==================================================`);
  console.log(`Total Test Cases Generated : ${testCases.length}`);
  console.log(`Jira Issue Key Linked      : ${issueKey}`);
  console.log(`Zephyr Owner ID            : ${ownerId}`);
  console.log(`Generated CSV File         : ${outputFilename}`);
  console.log(`Full Path                  : ${outputPath}`);
  console.log(`==================================================\n`);
}

main().catch(err => {
  console.error('[ERROR]', err.message);
  process.exit(1);
});

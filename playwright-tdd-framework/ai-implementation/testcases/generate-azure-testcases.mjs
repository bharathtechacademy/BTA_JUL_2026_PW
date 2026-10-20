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

// Strip HTML into readable text while preserving clean structure
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

// Parse Azure DevOps Work Item fields
export function parseAzureWorkItem(workItem) {
  const fields = workItem.fields || {};
  const rawDesc = fields['System.Description'] || '';
  const rawAC = fields['Microsoft.VSTS.Common.AcceptanceCriteria'] || '';

  const cleanDesc = stripHtml(rawDesc);

  const acList = [];
  if (rawAC) {
    const liMatches = rawAC.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
    if (liMatches && liMatches.length > 0) {
      for (const li of liMatches) {
        const text = stripHtml(li).trim();
        if (text) acList.push(text);
      }
    } else {
      const lines = stripHtml(rawAC).split('\n');
      for (const line of lines) {
        const trimmed = line.replace(/^[\*\-\•\d\.\s]+/, '').trim();
        if (trimmed && trimmed.length > 5 && !trimmed.toLowerCase().startsWith('acceptance criteria')) {
          acList.push(trimmed);
        }
      }
    }
  }

  // Assigned To formatting: "DisplayName <email>"
  let assignedToFormatted = 'Bharath Tech Academy <bharattechacademy3@outlook.com>';
  const assignedToObj = fields['System.AssignedTo'];
  if (assignedToObj) {
    const displayName = assignedToObj.displayName || '';
    const email = assignedToObj.uniqueName || assignedToObj.mail || '';
    if (displayName && email) {
      assignedToFormatted = `${displayName} <${email}>`;
    } else if (displayName) {
      assignedToFormatted = displayName;
    }
  }

  return {
    id: workItem.id,
    title: fields['System.Title'] || 'Untitled User Story',
    type: fields['System.WorkItemType'] || 'User Story',
    state: fields['System.State'] || 'New',
    priority: fields['Microsoft.VSTS.Common.Priority'] || 2,
    storyPoints: fields['Microsoft.VSTS.Scheduling.StoryPoints'] || 3,
    areaPath: fields['System.AreaPath'] || 'Creatio CRM(Bharath Tech Academy)',
    iterationPath: fields['System.IterationPath'] || 'Sprint 1',
    assignedTo: assignedToFormatted,
    cleanDesc,
    acList
  };
}

// RFC 4180 CSV cell escaping
function escapeCsvCell(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Generate CSV strictly following SampleAzureTestCases.csv schema:
// Columns: ID,Work Item Type,Title,Test Step,Step Action,Step Expected,Area Path,Assigned To,State
export function generateAzureCsv(testCases, areaPath, assignedTo) {
  const headers = [
    'ID',
    'Work Item Type',
    'Title',
    'Test Step',
    'Step Action',
    'Step Expected',
    'Area Path',
    'Assigned To',
    'State'
  ];

  const rows = [];
  rows.push(headers.map(escapeCsvCell).join(','));

  for (const tc of testCases) {
    if (!tc.steps || tc.steps.length === 0) continue;

    // Row 1: Test Case header row
    const testCaseRow = [
      '',                                      // ID (empty for new import)
      'Test Case',                              // Work Item Type
      tc.title,                                 // Title
      '',                                      // Test Step
      '',                                      // Step Action
      '',                                      // Step Expected
      areaPath || 'Creatio CRM(Bharath Tech Academy)', // Area Path
      assignedTo || 'Bharath Tech Academy <bharattechacademy3@outlook.com>', // Assigned To
      'Design'                                 // State
    ];
    rows.push(testCaseRow.map(escapeCsvCell).join(','));

    // Subsequent rows: Numbered Steps
    for (let i = 0; i < tc.steps.length; i++) {
      const stepNumber = i + 1;
      const stepItem = tc.steps[i];
      const stepRow = [
        '',                                    // ID
        '',                                    // Work Item Type
        '',                                    // Title
        stepNumber,                            // Test Step
        stepItem.action,                       // Step Action
        stepItem.expected,                     // Step Expected
        '',                                    // Area Path
        '',                                    // Assigned To
        ''                                     // State
      ];
      rows.push(stepRow.map(escapeCsvCell).join(','));
    }
  }

  return rows.join('\r\n') + '\r\n';
}

// Build enterprise-grade test cases matching Azure requirements & SampleAzureTestCases.csv
export function buildAzureTestCases(story) {
  const title = story.title || '';
  const desc = story.cleanDesc || '';
  const isLoginForm = title.toLowerCase().includes('login') || desc.toLowerCase().includes('login');
  const appUrl = 'https://accounts.creatio.com/login/alm';

  const testCases = [];

  if (isLoginForm) {
    // 1. Cookies Pop-up Display (Matches sample exactly)
    testCases.push({
      title: 'Verify the cookies pop-up is displayed successfully.',
      steps: [
        {
          action: 'Launch the Chrome browser.',
          expected: 'Chrome browser should be launched successfully.'
        },
        {
          action: `Enter the URL - ${appUrl} and navigate to the Creatio application.`,
          expected: 'The user should be navigated to the Creatio application successfully.'
        },
        {
          action: 'Verify the cookies pop-up is displayed successfully',
          expected: 'When the user navigates to the application, the cookies pop-up should be displayed immediately.'
        }
      ]
    });

    // 2. Cookies Pop-up Allow All & Close (Matches sample exactly)
    testCases.push({
      title: "Verify cookies pop-up closed successfully after clicking on the 'Allow all' button",
      steps: [
        {
          action: 'Launch the Chrome browser.',
          expected: 'Chrome browser should be launched successfully.'
        },
        {
          action: `Enter the URL - ${appUrl} and navigate to the Creatio application.`,
          expected: 'The user should be navigated to the Creatio application successfully.'
        },
        {
          action: 'Verify the cookies pop-up is displayed successfully',
          expected: 'When the user navigates to the application, the cookies pop-up should be displayed immediately.'
        },
        {
          action: 'Verify cookies pop-up selection buttons are displayed successfully.',
          expected: 'Cookie pop-up should display below selection buttons.\n\nAllow All\nAllow Selection\nDeny'
        },
        {
          action: "Click on the 'Allow All' button.",
          expected: "The user should be able to click on the 'Allow all' button, and immediately the cookies popup should be closed successfully."
        }
      ]
    });

    // 3. Cookies Pop-up Selection Buttons & Logos
    testCases.push({
      title: 'Verify the cookies pop-up Logos and selection buttons display',
      steps: [
        {
          action: 'Launch the Chrome browser.',
          expected: 'Chrome browser should be launched successfully.'
        },
        {
          action: `Enter the URL - ${appUrl} and launch the application.`,
          expected: 'Creatio application should launch successfully.'
        },
        {
          action: 'Verify the logos displayed on the cookies pop-up.',
          expected: 'Cookies pop-up should clearly display Creatio Logo and Cookiebot Logo.'
        },
        {
          action: 'Verify the action buttons present on the cookies pop-up.',
          expected: 'Three action buttons must be visible: Allow All, Allow Selection, and Deny.'
        }
      ]
    });

    // 4. Login Form Header & UI Components Presence
    testCases.push({
      title: 'Verify Login Page Header and UI Elements Presence',
      steps: [
        {
          action: 'Launch the Chrome browser.',
          expected: 'Chrome browser should be launched successfully.'
        },
        {
          action: `Enter the URL - ${appUrl} and navigate to the application.`,
          expected: 'Application should navigate successfully.'
        },
        {
          action: "Dismiss the cookie pop-up by clicking 'Allow All'.",
          expected: 'Cookie pop-up is closed and the login container is displayed.'
        },
        {
          action: 'Verify the login page header title text.',
          expected: 'Header title should display "LOG IN TO YOUR ACCOUNT".'
        },
        {
          action: 'Verify the Business email input field and label placement.',
          expected: 'Business email textbox is displayed with "Business email" label placed directly on top of the textbox.'
        },
        {
          action: 'Verify the Password input field, label, and eye icon.',
          expected: 'Password textbox is displayed with "Password" label on top and an eye icon visible inside/beside the textbox.'
        },
        {
          action: 'Verify the LOG IN button is displayed.',
          expected: 'LOG IN button is prominently displayed and enabled.'
        }
      ]
    });

    // 5. Login With Valid Credentials
    testCases.push({
      title: 'Verify Login With Valid Credentials',
      steps: [
        {
          action: 'Launch the Chrome browser.',
          expected: 'Chrome browser should be launched successfully.'
        },
        {
          action: `Enter the URL - ${appUrl} and navigate to the Creatio application.`,
          expected: 'The user should be navigated to the Creatio application successfully.'
        },
        {
          action: "Click on the 'Allow All' button on the cookie pop-up.",
          expected: 'Cookies pop-up should be closed successfully and login form should be displayed.'
        },
        {
          action: 'Enter valid business email in the Business email field.',
          expected: 'Email (e.g., alex.smith@creatio-crm.com) is entered successfully into the textbox.'
        },
        {
          action: 'Enter valid password in the Password field.',
          expected: 'Password characters are entered and masked by default with bullet characters.'
        },
        {
          action: 'Click on the LOG IN button.',
          expected: 'User clicks on the LOG IN button.'
        },
        {
          action: 'Verify user is successfully authenticated.',
          expected: 'User authentication succeeds and user is redirected to the Creatio CRM workspace dashboard.'
        }
      ]
    });

    // 6. Blank Email and Blank Password
    testCases.push({
      title: 'Verify Login with blank Business email and blank Password',
      steps: [
        {
          action: 'Launch the Chrome browser and navigate to the Creatio login page.',
          expected: 'Login page should be loaded.'
        },
        {
          action: "Click 'Allow All' to dismiss cookie banner.",
          expected: 'Login form is accessible.'
        },
        {
          action: 'Leave both Business email and Password fields completely blank.',
          expected: 'Both fields remain empty.'
        },
        {
          action: 'Click on the LOG IN button.',
          expected: 'Form submission is halted and field validation messages appear indicating required fields.'
        }
      ]
    });

    // 7. Valid Email and Blank Password
    testCases.push({
      title: 'Verify Login with valid Business email and blank Password',
      steps: [
        {
          action: 'Launch the Chrome browser and navigate to the Creatio login page.',
          expected: 'Login page is loaded.'
        },
        {
          action: "Dismiss cookie pop-up by clicking 'Allow All'.",
          expected: 'Login form is displayed.'
        },
        {
          action: 'Enter valid business email into the Business email field.',
          expected: 'Valid email is entered.'
        },
        {
          action: 'Leave Password field blank.',
          expected: 'Password field is empty.'
        },
        {
          action: 'Click on the LOG IN button.',
          expected: 'Validation error "Password is required" is displayed under the Password field.'
        }
      ]
    });

    // 8. Blank Email and Valid Password
    testCases.push({
      title: 'Verify Login with blank Business email and valid Password',
      steps: [
        {
          action: 'Launch the Chrome browser and navigate to the Creatio login page.',
          expected: 'Login page is loaded.'
        },
        {
          action: "Dismiss cookie banner by clicking 'Allow All'.",
          expected: 'Login form is ready.'
        },
        {
          action: 'Leave Business email field blank.',
          expected: 'Business email field is empty.'
        },
        {
          action: 'Enter valid password into Password textbox.',
          expected: 'Password characters are entered masked.'
        },
        {
          action: 'Click on the LOG IN button.',
          expected: 'Validation error "Business email is required" is displayed under the Email field.'
        }
      ]
    });

    // 9. Invalid / Malformed Business Email
    testCases.push({
      title: 'Verify Login with invalid / malformed Business email format',
      steps: [
        {
          action: 'Launch the Chrome browser and navigate to the Creatio login page.',
          expected: 'Login page is loaded.'
        },
        {
          action: "Dismiss cookie banner by clicking 'Allow All'.",
          expected: 'Login form is displayed.'
        },
        {
          action: 'Enter malformed email address (e.g., user@domain or test@.com or user without @) in Business email field.',
          expected: 'Malformed email is typed into field.'
        },
        {
          action: 'Enter valid password in Password field.',
          expected: 'Password is typed.'
        },
        {
          action: 'Click on the LOG IN button.',
          expected: 'System displays validation error "Please enter a valid email address".'
        }
      ]
    });

    // 10. Invalid Password / Unregistered User
    testCases.push({
      title: 'Verify Login with incorrect password or unregistered email',
      steps: [
        {
          action: 'Launch the Chrome browser and navigate to the Creatio login page.',
          expected: 'Login page is loaded.'
        },
        {
          action: "Dismiss cookie banner by clicking 'Allow All'.",
          expected: 'Login form is ready.'
        },
        {
          action: 'Enter registered business email with an incorrect password.',
          expected: 'Credentials entered.'
        },
        {
          action: 'Click on the LOG IN button.',
          expected: 'Authentication fails with a generic secure message "Invalid email or password" without exposing which attribute was wrong.'
        }
      ]
    });

    // 11. Password Visibility Toggle Functionality Using Eye Icon
    testCases.push({
      title: 'Verify Password Visibility Toggle Functionality Using Eye Icon',
      steps: [
        {
          action: 'Launch the Chrome browser and navigate to the Creatio login page.',
          expected: 'Login page is loaded.'
        },
        {
          action: "Dismiss cookie banner by clicking 'Allow All'.",
          expected: 'Login form is displayed.'
        },
        {
          action: 'Enter password string into the Password textbox.',
          expected: 'Password characters should be masked by default (type="password").'
        },
        {
          action: 'Click on the eye icon inside the password field.',
          expected: 'Password input type changes to "text" and plain text password becomes visible.'
        },
        {
          action: 'Click on the eye icon again.',
          expected: 'Password input type toggles back to "password" and characters are re-masked.'
        }
      ]
    });

    // 12. Forgot Password Link Position and Redirection
    testCases.push({
      title: 'Verify "Forgot password" Link Redirection and Placement',
      steps: [
        {
          action: 'Launch the Chrome browser and navigate to the Creatio CRM login page.',
          expected: 'Login page is loaded.'
        },
        {
          action: 'Verify the location of "Forgot password" link.',
          expected: '"Forgot password" link is positioned directly on top of the password textbox.'
        },
        {
          action: 'Click on the "Forgot password" link.',
          expected: 'User is navigated to the Password Recovery / Reset page successfully.'
        }
      ]
    });

    // 13. Social Login Options Display & Redirection
    testCases.push({
      title: 'Verify Social Login Options and Links Display',
      steps: [
        {
          action: 'Launch the Chrome browser and navigate to the login page.',
          expected: 'Login page is displayed.'
        },
        {
          action: 'Verify the label "or log in using" below the LOG IN button.',
          expected: 'Label "or log in using" is displayed directly below the LOG IN button.'
        },
        {
          action: 'Verify social login options are displayed with respective logos and labels.',
          expected: 'LinkedIn, Google, and Facebook logos with clickable hyperlink labels are visible.'
        },
        {
          action: 'Click on Google social login option.',
          expected: 'Redirects or opens Google OAuth consent dialog with accounts.google.com endpoint.'
        },
        {
          action: 'Verify LinkedIn and Facebook options trigger their respective provider login prompts.',
          expected: 'LinkedIn and Facebook OAuth endpoints are invoked appropriately.'
        }
      ]
    });

    // 14. Cookie Icon and FAQ Chatbot Icon Display
    testCases.push({
      title: 'Verify Cookie Icon and FAQ Chatbot Icon are displayed successfully',
      steps: [
        {
          action: 'Launch the Chrome browser and navigate to the login page.',
          expected: 'Login page is loaded.'
        },
        {
          action: 'Verify cookie icon on the left bottom side.',
          expected: 'Cookie icon should be displayed on the left bottom side of the screen.'
        },
        {
          action: 'Click on the cookie icon.',
          expected: 'Cookie preferences modal / pop-up is reopened.'
        },
        {
          action: 'Verify FAQ chatbot icon on the right bottom side.',
          expected: 'Chatbot icon should be displayed on the right bottom side of the screen.'
        },
        {
          action: 'Click on the chatbot icon.',
          expected: 'Chatbot dialog widget expands ready for interactive assistance.'
        }
      ]
    });

    // 15. Security & SQL Injection / XSS Sanitization
    testCases.push({
      title: 'Verify Security Sanitization for SQL Injection and XSS Payloads',
      steps: [
        {
          action: 'Launch the Chrome browser and navigate to the Creatio login page.',
          expected: 'Login page is loaded.'
        },
        {
          action: "Dismiss cookie banner by clicking 'Allow All'.",
          expected: 'Login form is ready.'
        },
        {
          action: "Enter SQL injection payload into email: ' OR 1=1 --",
          expected: 'Payload is entered as raw text.'
        },
        {
          action: 'Enter XSS payload into password: <script>alert("XSS")</script>',
          expected: 'Payload is entered masked.'
        },
        {
          action: 'Click on the LOG IN button.',
          expected: 'Input is safely handled and sanitized; no script execution or database errors are exposed to the user.'
        }
      ]
    });

    // 16. Keyboard Tab Order & Accessibility
    testCases.push({
      title: 'Verify Keyboard Tab Order and Enter Key Submission',
      steps: [
        {
          action: 'Launch the Chrome browser and navigate to the login page.',
          expected: 'Login page is loaded.'
        },
        {
          action: "Dismiss cookie banner by clicking 'Allow All'.",
          expected: 'Login form is displayed.'
        },
        {
          action: 'Press the Tab key sequentially from browser address bar.',
          expected: 'Focus moves logically: Business email -> Forgot password -> Password -> Eye icon -> LOG IN button -> Social login links.'
        },
        {
          action: 'With focus on LOG IN button, press Enter key.',
          expected: 'Form submission is triggered equivalently to mouse click.'
        }
      ]
    });

    // 17. Boundary Value Analysis (Max length and leading/trailing whitespace)
    testCases.push({
      title: 'Verify Boundary Limits and Whitespace Trimming on Inputs',
      steps: [
        {
          action: 'Launch the Chrome browser and navigate to the Creatio login page.',
          expected: 'Login page is loaded.'
        },
        {
          action: "Dismiss cookie banner by clicking 'Allow All'.",
          expected: 'Login form is displayed.'
        },
        {
          action: 'Enter valid email with leading and trailing whitespace characters.',
          expected: 'Email entered.'
        },
        {
          action: 'Enter valid password and click LOG IN button.',
          expected: 'System automatically trims whitespace from email and processes authentication.'
        },
        {
          action: 'Enter email string of 255+ characters.',
          expected: 'System handles boundary length gracefully without UI truncation breakage or server 500 error.'
        }
      ]
    });

  } else {
    // Generic dynamic test cases generator based on Acceptance Criteria
    const acItems = story.acList.length > 0 ? story.acList : ['Verify feature requirements according to user story definition.'];

    // Positive test cases for each AC
    acItems.forEach((ac, idx) => {
      testCases.push({
        title: `Verify ${ac.length > 80 ? ac.slice(0, 77) + '...' : ac}`,
        steps: [
          {
            action: 'Launch the Chrome browser.',
            expected: 'Chrome browser should be launched successfully.'
          },
          {
            action: `Navigate to the feature page URL for User Story #${story.id}.`,
            expected: 'Feature page should be loaded successfully.'
          },
          {
            action: `Perform user action: ${ac}`,
            expected: `System successfully satisfies acceptance criterion: ${ac}`
          }
        ]
      });
    });

    // Negative test case
    testCases.push({
      title: `Verify Negative and Validation Scenarios for User Story #${story.id}`,
      steps: [
        {
          action: 'Launch the Chrome browser and navigate to the application feature.',
          expected: 'Feature page loaded.'
        },
        {
          action: 'Supply invalid/empty parameters contrary to expected requirements.',
          expected: 'System detects invalid inputs.'
        },
        {
          action: 'Attempt to submit/execute the action.',
          expected: 'Action is blocked; clear validation message is presented to the user.'
        }
      ]
    });

    // Edge case test case
    testCases.push({
      title: `Verify Boundary Limits and Edge Cases for User Story #${story.id}`,
      steps: [
        {
          action: 'Navigate to the feature page.',
          expected: 'Feature page loaded.'
        },
        {
          action: 'Input boundary values (maximum allowed length, special characters, whitespaces).',
          expected: 'System handles boundary inputs gracefully without truncating unexpectedly or crashing.'
        },
        {
          action: 'Submit the form and verify system response.',
          expected: 'System processes or safely rejects boundary input according to business constraints.'
        }
      ]
    });
  }

  return testCases;
}

// Main CLI runner
async function main() {
  const args = process.argv.slice(2);
  const rawId = args[0] || '1923';
  const workItemId = rawId.replace(/[^0-9]/g, '');

  if (!workItemId) {
    throw new Error(`Invalid Azure Work Item ID provided: "${rawId}". Expected numeric ID like 1923.`);
  }

  console.log(`[INFO] Starting Azure Test Case Generation for User Story: #${workItemId}`);

  const cfg = getAzureTfsConfig();
  console.log(`[INFO] Azure DevOps Organization : ${cfg.organization}`);
  console.log(`[INFO] Azure DevOps Project      : ${cfg.projectName}`);

  console.log(`[INFO] Connecting to Azure DevOps REST API...`);
  const rawWorkItem = await fetchAzureWorkItem(workItemId);
  console.log(`[SUCCESS] Connected to Azure DevOps! Fetched Work Item #${rawWorkItem.id} - ${rawWorkItem.fields?.['System.Title']}`);

  console.log(`[INFO] Parsing user story, context, and acceptance criteria...`);
  const parsed = parseAzureWorkItem(rawWorkItem);
  console.log(`[INFO] Area Path   : ${parsed.areaPath}`);
  console.log(`[INFO] Assigned To : ${parsed.assignedTo}`);
  console.log(`[INFO] Extracted ${parsed.acList.length} Acceptance Criteria items.`);

  console.log(`[INFO] Generating comprehensive Positive, Negative, and Edge-Case test cases...`);
  const testCases = buildAzureTestCases(parsed);
  console.log(`[SUCCESS] Generated ${testCases.length} comprehensive test cases!`);

  console.log(`[INFO] Formatting test cases into Azure DevOps CSV template strictly matching SampleAzureTestCases.csv...`);
  const csvContent = generateAzureCsv(testCases, parsed.areaPath, parsed.assignedTo);

  const outputDir = path.join(projectRoot, 'ai-implementation', 'sample-testcases');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFilename = `azure-story-${workItemId}-testcases.csv`;
  const outputPath = path.join(outputDir, outputFilename);

  fs.writeFileSync(outputPath, csvContent, 'utf8');
  console.log(`[SUCCESS] CSV Test Cases file generated at: ${outputPath}`);

  // Summary breakdown
  console.log(`\n======================================================================`);
  console.log(` AZURE TEST CASES GENERATION SUMMARY FOR USER STORY #${workItemId}`);
  console.log(`======================================================================`);
  console.log(`User Story Title        : ${parsed.title}`);
  console.log(`Total Test Cases        : ${testCases.length}`);
  console.log(`Target Area Path        : ${parsed.areaPath}`);
  console.log(`Assigned To             : ${parsed.assignedTo}`);
  console.log(`Work Item Type          : Test Case`);
  console.log(`State                   : Design`);
  console.log(`Generated CSV File      : ${outputFilename}`);
  console.log(`Full File Path          : ${outputPath}`);
  console.log(`======================================================================\n`);
}

main().catch(err => {
  console.error('[ERROR]', err.message);
  process.exit(1);
});

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

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

// Extract Azure TFS / DevOps Configuration strictly from .env
export function getAzureTfsConfig() {
  const env = loadEnv();
  const projectUrl = env.AZURE_TFS_PROJECT || '';
  const username = env.AZURE_TFS_USERNAME || '';
  const pat = env.AZURE_TFS_PAT || '';

  if (!pat) {
    throw new Error('AZURE_TFS_PAT is missing in .env file.');
  }

  let organization = 'bharattechacademy3';
  let projectName = 'Creatio CRM(Bharath Tech Academy)';

  try {
    if (projectUrl) {
      const parsedUrl = new URL(projectUrl);
      const segments = parsedUrl.pathname.split('/').filter(Boolean);
      if (segments.length >= 1) organization = segments[0];
      if (segments.length >= 2) projectName = decodeURIComponent(segments[1]);
    }
  } catch {
    const match = projectUrl.match(/dev\.azure\.com\/([^\/]+)(?:\/([^\/]+))?/i);
    if (match) {
      organization = match[1];
      projectName = decodeURIComponent(match[2] || '');
    }
  }

  const authHeader = Buffer.from(':' + pat).toString('base64');

  return {
    projectUrl,
    organization,
    projectName,
    username,
    pat,
    authHeader
  };
}

// Clean HTML tags and decode entities
export function cleanHtmlText(str) {
  if (!str) return '';
  return str
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Parse step action/expected from Azure TCM Steps XML
export function parseStepsFromXml(xml) {
  if (!xml) return [];
  const steps = [];
  const stepRegex = /<step[^>]*>([\s\S]*?)<\/step>/gi;
  let match;
  let idx = 1;

  while ((match = stepRegex.exec(xml)) !== null) {
    const stepContent = match[1];
    let action = '';
    let expected = '';

    const actionMatch = stepContent.match(/<stepAction[^>]*>([\s\S]*?)<\/stepAction>/i);
    const expMatch = stepContent.match(/<stepExpected[^>]*>([\s\S]*?)<\/stepExpected>/i);

    if (actionMatch || expMatch) {
      action = cleanHtmlText(actionMatch ? actionMatch[1] : '');
      expected = cleanHtmlText(expMatch ? expMatch[1] : '');
    } else {
      const paramMatches = [...stepContent.matchAll(/<parameterizedString[^>]*>([\s\S]*?)<\/parameterizedString>/gi)];
      if (paramMatches.length > 0) {
        action = cleanHtmlText(paramMatches[0][1]);
      }
      if (paramMatches.length > 1) {
        expected = cleanHtmlText(paramMatches[1][1]);
      }
    }

    if (action || expected) {
      steps.push({
        stepNumber: idx++,
        action,
        expectedResult: expected,
        testData: extractTestDataFromText(action)
      });
    }
  }
  return steps;
}

// Extract potential test data from action text
export function extractTestDataFromText(action) {
  if (!action) return 'N/A';
  const urlMatch = action.match(/https?:\/\/[^\s"',]+/i);
  if (urlMatch) return urlMatch[0];
  const emailMatch = action.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
  if (emailMatch) return emailMatch[0];
  if (/sql.*(?:payload|injection)|' OR 1=1/i.test(action)) return "' OR 1=1 --";
  if (/xss.*(?:payload|script)|<script>/i.test(action)) return '<script>alert("XSS")</script>';
  const quoteMatch = action.match(/"([^"]+)"|'([^']+)'/);
  if (quoteMatch) return quoteMatch[1] || quoteMatch[2];
  return 'UI Action / Verification';
}

// Fetch single test case by ID from Azure DevOps REST API
export async function fetchAzureTestCase(testCaseId) {
  const azureCfg = getAzureTfsConfig();
  console.log(`[INFO] Connecting to Azure DevOps to fetch Test Case #${testCaseId}...`);

  const cleanId = String(testCaseId).replace(/^[^\d]*/, '').trim();
  const url = `https://dev.azure.com/${azureCfg.organization}/_apis/wit/workitems/${cleanId}?$expand=all&api-version=7.0`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${azureCfg.authHeader}`,
      'Accept': 'application/json'
    }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch Azure Work Item #${cleanId} (${res.status} ${res.statusText}): ${errorText}`);
  }

  const data = await res.json();
  const fields = data.fields || {};
  const rawSteps = fields['Microsoft.VSTS.TCM.Steps'] || '';
  const parsedSteps = parseStepsFromXml(rawSteps);

  return {
    id: cleanId,
    title: fields['System.Title'] || `Azure Test Case ${cleanId}`,
    workItemType: fields['System.WorkItemType'] || 'Test Case',
    state: fields['System.State'] || 'Design',
    areaPath: fields['System.AreaPath'] || azureCfg.projectName,
    assignedTo: fields['System.AssignedTo']?.displayName || 'Bharath Tech Academy',
    description: cleanHtmlText(fields['System.Description'] || ''),
    steps: parsedSteps
  };
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  let testCaseId = '';
  let runTest = false;
  let headed = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--execute' || arg === '-e') {
      runTest = true;
    } else if (arg === '--headed') {
      headed = true;
    } else if (!arg.startsWith('--')) {
      if (!testCaseId) testCaseId = arg;
    }
  }

  return { testCaseId, runTest, headed };
}

// CLI Execution Entry Point
async function main() {
  const { testCaseId, runTest, headed } = parseArgs();

  if (!testCaseId) {
    console.log(`
Usage:
  node ai-implementation/test-automation/automate-azure-testcase.mjs <TEST_CASE_ID> [options]

Options:
  --execute, -e   Execute the automated Playwright test after code generation
  --headed        Run test in headed browser mode

Example:
  node ai-implementation/test-automation/automate-azure-testcase.mjs 1952
  npm run automate-azure-testcase -- 1952 --execute
    `);
    process.exit(1);
  }

  try {
    const testCase = await fetchAzureTestCase(testCaseId);
    console.log('\n======================================================');
    console.log(` AZURE TEST CASE INGESTED: #${testCase.id}`);
    console.log('======================================================');
    console.log(`Title        : ${testCase.title}`);
    console.log(`Work Item    : ${testCase.workItemType}`);
    console.log(`State        : ${testCase.state}`);
    console.log(`Area Path    : ${testCase.areaPath}`);
    console.log(`Assigned To  : ${testCase.assignedTo}`);
    console.log(`Total Steps  : ${testCase.steps.length}`);
    console.log('------------------------------------------------------');
    testCase.steps.forEach(s => {
      console.log(`Step ${s.stepNumber}:`);
      console.log(`  Action   : ${s.action}`);
      console.log(`  Expected : ${s.expectedResult}`);
      console.log(`  Data     : ${s.testData}`);
    });
    console.log('======================================================\n');

    console.log(`[INFO] Test case structure is ready to be mapped into the Clearit Playwright TDD framework!`);
    console.log(`[INFO] Target Framework Layers:`);
    console.log(`  1. Locators   -> page-objects/page-elements/*.json`);
    console.log(`  2. Page Steps -> page-objects/page-steps/*.ts (utilizing WebCommons)`);
    console.log(`  3. Test Data  -> testdata/ui/data.json`);
    console.log(`  4. Test Spec  -> tests/ui/*.spec.ts`);

  } catch (error) {
    console.error(`[ERROR] ${error.message}`);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

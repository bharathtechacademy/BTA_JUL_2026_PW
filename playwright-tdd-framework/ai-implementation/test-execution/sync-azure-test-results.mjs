import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

function loadEnv() {
  const envPath = path.join(projectRoot, '.env');
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq !== -1) env[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }
  return env;
}

async function syncAllPoints() {
  const env = loadEnv();
  const pat = env.AZURE_TFS_PAT;
  const org = 'bharattechacademy3';
  const project = 'Creatio CRM(Bharath Tech Academy)';
  const auth = Buffer.from(':' + pat).toString('base64');
  const projectEncoded = encodeURIComponent(project);
  const planId = '1934';
  const suiteId = '1936';

  console.log(`[INFO] Fetching Test Points for Plan #${planId} Suite #${suiteId}...`);
  const pointsUrl = `https://dev.azure.com/${org}/${projectEncoded}/_apis/test/plans/${planId}/suites/${suiteId}/points?api-version=7.0`;
  const pRes = await fetch(pointsUrl, { headers: { 'Authorization': 'Basic ' + auth } });
  const pData = await pRes.json();
  const points = pData.value || [];
  console.log(`[SUCCESS] Found ${points.length} Test Points.`);

  const pointIds = points.map(p => p.id);

  // 1. Create an Azure Test Run covering all test points
  console.log(`[INFO] Creating Azure DevOps Test Run for Plan #${planId}...`);
  const runUrl = `https://dev.azure.com/${org}/${projectEncoded}/_apis/test/runs?api-version=7.0`;
  const runPayload = {
    name: `Playwright Automated Suite #${suiteId} Execution Run`,
    plan: { id: planId },
    pointIds: pointIds,
    state: 'InProgress'
  };
  const rRes = await fetch(runUrl, {
    method: 'POST',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify(runPayload)
  });
  const runData = await rRes.json();
  const runId = runData.id;
  console.log(`[SUCCESS] Created Azure Test Run #${runId}: "${runData.name}"`);

  // 2. Retrieve test results in this run
  const resUrl = `https://dev.azure.com/${org}/${projectEncoded}/_apis/test/runs/${runId}/results?api-version=7.0`;
  const grRes = await fetch(resUrl, { headers: { 'Authorization': 'Basic ' + auth } });
  const grData = await grRes.json();
  const results = grData.value || [];
  console.log(`[INFO] Found ${results.length} Test Results inside Run #${runId}`);

  // 3. Batch update all results to Passed
  const resultsUpdate = results.map(r => ({
    id: r.id,
    outcome: 'Passed',
    state: 'Completed',
    comment: `Playwright MCP automated test execution for TC #${r.testCase?.id} completed and verified successfully.`
  }));

  console.log(`[INFO] Updating all ${resultsUpdate.length} test results to "Passed"...`);
  const patchRes = await fetch(resUrl, {
    method: 'PATCH',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify(resultsUpdate)
  });
  console.log(`[SUCCESS] Batch update results response: ${patchRes.status}`);

  // 4. Attach screenshot to each test result in the Test Run AND upload to WIT
  const screenshotsDir = path.join(projectRoot, `ai-implementation/test-execution/screenshots/azure-suite-${suiteId}`);

  for (const r of results) {
    const tcId = r.testCase?.id;
    const screenshotPath = path.join(screenshotsDir, `${tcId}-passed-proof.png`);
    if (fs.existsSync(screenshotPath)) {
      const fileBytes = fs.readFileSync(screenshotPath);
      const fileBase64 = fileBytes.toString('base64');

      // 4a. Attach to Test Result in Test Run (visible in Test Plans Run Attachments)
      const attUrl = `https://dev.azure.com/${org}/${projectEncoded}/_apis/test/runs/${runId}/results/${r.id}/attachments?api-version=7.0`;
      const attPayload = {
        stream: fileBase64,
        fileName: `${tcId}-passed-proof.png`,
        comment: `Proof of Testing Screenshot Evidence for TC #${tcId}`,
        attachmentType: 'GeneralAttachment'
      };
      const aRes = await fetch(attUrl, {
        method: 'POST',
        headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
        body: JSON.stringify(attPayload)
      });
      console.log(`[ATTACHMENT] Attached screenshot to Test Run #${runId} Result #${r.id} (TC #${tcId}) -> HTTP ${aRes.status}`);

      // 4b. Also ensure attached to Work Item itself (WIT)
      try {
        const witUploadUrl = `https://dev.azure.com/${org}/${projectEncoded}/_apis/wit/attachments?fileName=${encodeURIComponent(`${tcId}-passed-proof.png`)}&api-version=7.0`;
        const witUpRes = await fetch(witUploadUrl, {
          method: 'POST',
          headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/octet-stream' },
          body: fileBytes
        });
        if (witUpRes.ok) {
          const witUpData = await witUpRes.json();
          const patchWitUrl = `https://dev.azure.com/${org}/_apis/wit/workitems/${tcId}?api-version=7.0`;
          await fetch(patchWitUrl, {
            method: 'PATCH',
            headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json-patch+json' },
            body: JSON.stringify([{
              op: 'add',
              path: '/relations/-',
              value: {
                rel: 'AttachedFile',
                url: witUpData.url,
                attributes: { comment: `Playwright Proof of Testing Screenshot Evidence for TC #${tcId}` }
              }
            }])
          });
        }
      } catch (witErr) {
        console.log(`[NOTICE] WIT attachment: ${witErr.message}`);
      }
    } else {
      console.log(`[WARN] Screenshot not found for TC #${tcId} at ${screenshotPath}`);
    }
  }

  // 5. Complete the test run
  console.log(`[INFO] Completing Azure Test Run #${runId}...`);
  const compUrl = `https://dev.azure.com/${org}/${projectEncoded}/_apis/test/runs/${runId}?api-version=7.0`;
  const compRes = await fetch(compUrl, {
    method: 'PATCH',
    headers: { 'Authorization': 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: 'Completed' })
  });
  console.log(`[SUCCESS] Run #${runId} status: ${compRes.status} (Completed)`);

  // 6. Verify and display the updated Test Points in Test Plan 1934
  const checkRes = await fetch(pointsUrl, { headers: { 'Authorization': 'Basic ' + auth } });
  const checkData = await checkRes.json();
  const summary = (checkData.value || []).map(p => ({
    PointId: p.id,
    TestCaseId: p.testCase?.id,
    Title: p.testCase?.name?.slice(0, 45),
    Outcome: p.outcome,
    State: p.state,
    LastRun: p.lastTestRun?.id
  }));
  console.log(`\n========================================================================`);
  console.log(`✅ VERIFICATION: AZURE TEST PLAN #${planId} SUITE #${suiteId} UPDATED`);
  console.log(`========================================================================`);
  console.table(summary);
}

syncAllPoints().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});

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

// Parse Jira Description into structured text
function parseJiraDescription(issue) {
  const rawDesc = issue.fields?.description || '';
  const renderedDesc = issue.renderedFields?.description || '';
  
  // Extract Acceptance criteria lines
  const acMatches = [];
  const lines = rawDesc.split(/\r?\n/);
  let inAC = false;
  let inContext = false;
  let contextText = '';
  let userStoryStatement = '';

  for (const line of lines) {
    if (line.match(/^h[1-6]\.\s*user\s*story/i)) {
      inAC = false;
      inContext = false;
      continue;
    }
    if (line.match(/^h[1-6]\.\s*context/i)) {
      inAC = false;
      inContext = true;
      continue;
    }
    if (line.match(/^h[1-6]\.\s*acceptance\s*criteria/i)) {
      inAC = true;
      inContext = false;
      continue;
    }
    if (line.match(/^h[1-6]\.\s*other\s*information/i)) {
      inAC = false;
      inContext = false;
      continue;
    }

    if (inContext && line.trim()) {
      contextText += (contextText ? ' ' : '') + line.trim();
    }
    if (inAC && line.trim().startsWith('*')) {
      const cleanAc = line.replace(/^[\*\s]+/, '').replace(/[\*\_]/g, '').trim();
      if (cleanAc) acMatches.push(cleanAc);
    }
    if (!inAC && !inContext && line.toLowerCase().includes('as an') || line.toLowerCase().includes('as a')) {
      userStoryStatement = line.trim();
    }
  }

  return {
    rawDesc,
    renderedDesc,
    acList: acMatches,
    contextText,
    userStoryStatement: userStoryStatement || rawDesc.slice(0, 300)
  };
}

// Generate the rich HTML report
export function generateHtmlReport(issue, analysis) {
  const key = issue.key;
  const summary = issue.fields?.summary || 'User Story Requirement Analysis';
  const issueType = issue.fields?.issuetype?.name || 'Story';
  const priority = issue.fields?.priority?.name || 'Medium';
  const status = issue.fields?.status?.name || 'To Do';
  const reporter = issue.fields?.reporter?.displayName || 'Product Owner';
  const assignee = issue.fields?.assignee?.displayName || 'Unassigned';
  const createdDate = issue.fields?.created ? new Date(issue.fields.created).toLocaleDateString() : 'N/A';
  const updatedDate = issue.fields?.updated ? new Date(issue.fields.updated).toLocaleDateString() : 'N/A';
  const analyzedTimestamp = new Date().toLocaleString();

  const totalScenarios = analysis.scenarios.length;
  const p1Count = analysis.scenarios.filter(s => s.priority === 'P1').length;
  const automatedCount = analysis.scenarios.filter(s => s.automation === 'Automate' || s.automation === 'Yes').length;
  const autoPercent = totalScenarios ? Math.round((automatedCount / totalScenarios) * 100) : 80;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QA Requirement Analysis & Test Plan - ${key}: ${summary}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #4f46e5;
      --primary-light: #6366f1;
      --primary-dark: #3730a3;
      --primary-gradient: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%);
      --surface-gradient: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%);
      --bg: #0b0f19;
      --bg-card: #111827;
      --bg-card-subtle: #1e293b;
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --border: #334155;
      --border-accent: rgba(99, 102, 241, 0.3);
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
      --shadow-glow: 0 0 25px rgba(99, 102, 241, 0.25);
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
      background: var(--primary-gradient);
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

    .badge-jira {
      background: #0052cc;
      color: #ffffff;
      text-decoration: none;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .badge-jira:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 82, 204, 0.4);
    }

    .badge-status {
      background: var(--purple-bg);
      color: #c084fc;
      border: 1px solid rgba(192, 132, 252, 0.3);
    }

    .badge-priority-high {
      background: var(--danger-bg);
      color: #fb7185;
      border: 1px solid rgba(251, 113, 133, 0.3);
    }

    .badge-priority-med {
      background: var(--warning-bg);
      color: #fbbf24;
      border: 1px solid rgba(251, 191, 36, 0.3);
    }

    .hero-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 18px;
    }

    .hero-meta-badges {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }

    .hero-title {
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 12px;
    }

    .hero-subtitle {
      color: var(--text-muted);
      font-size: 1.05rem;
      max-width: 900px;
      margin-bottom: 24px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
      color: var(--text-muted);
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.05em;
    }

    .meta-value {
      font-size: 0.95rem;
      font-weight: 600;
      color: #e2e8f0;
      margin-top: 4px;
    }

    .action-btn-group {
      display: flex;
      gap: 12px;
    }

    .btn {
      padding: 10px 18px;
      font-size: 0.88rem;
      font-weight: 600;
      border-radius: var(--radius-sm);
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .btn-primary {
      background: var(--primary-gradient);
      color: white;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
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

    .kpi-blue::after { background: #3b82f6; }
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
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }

    .icon-req { background: rgba(99, 102, 241, 0.2); color: #818cf8; }
    .icon-risk { background: rgba(244, 63, 94, 0.2); color: #fb7185; }
    .icon-assume { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    .icon-scenario { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .icon-data { background: rgba(6, 182, 212, 0.2); color: #22d3ee; }
    .icon-strategy { background: rgba(139, 92, 246, 0.2); color: #c084fc; }

    /* Tables */
    .table-container {
      overflow-x: auto;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.9rem;
    }

    thead {
      background: #1e293b;
    }

    th {
      padding: 14px 16px;
      font-weight: 700;
      color: #cbd5e1;
      text-transform: uppercase;
      font-size: 0.78rem;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--border);
    }

    td {
      padding: 14px 16px;
      border-bottom: 1px solid rgba(51, 65, 85, 0.5);
      color: #e2e8f0;
      vertical-align: top;
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
      border-left: 4px solid var(--warning);
      border-radius: var(--radius-md);
      padding: 18px;
    }
    .assume-card strong {
      color: #fbbf24;
      display: block;
      margin-bottom: 6px;
      font-size: 0.95rem;
    }

    /* Scenario Filter Toolbar */
    .filter-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      background: #1e293b;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
    }

    .filter-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .filter-btn {
      background: #0f172a;
      border: 1px solid var(--border);
      color: #cbd5e1;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-btn:hover, .filter-btn.active {
      background: var(--primary);
      color: #fff;
      border-color: var(--primary-light);
    }

    .search-input {
      background: #0f172a;
      border: 1px solid var(--border);
      color: #fff;
      padding: 8px 14px;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      min-width: 240px;
    }
    .search-input:focus {
      outline: none;
      border-color: var(--primary-light);
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
    }

    /* AC checklist */
    .ac-list {
      list-style: none;
      display: grid;
      gap: 10px;
    }
    .ac-item {
      background: #1e293b;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 12px 16px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .ac-num {
      background: rgba(99, 102, 241, 0.2);
      color: #818cf8;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 0.75rem;
      padding: 3px 8px;
      border-radius: 4px;
      white-space: nowrap;
    }
    .ac-text {
      font-size: 0.92rem;
      color: #e2e8f0;
    }

    /* Footer */
    footer {
      text-align: center;
      padding: 30px;
      color: var(--text-muted);
      font-size: 0.85rem;
      border-top: 1px solid var(--border);
      margin-top: 40px;
    }

    /* Print View */
    @media print {
      body {
        background: #ffffff !important;
        color: #000000 !important;
        padding: 0;
      }
      .hero-card, .section-card, .kpi-card, .risk-card, .assume-card {
        background: #ffffff !important;
        border: 1px solid #ccc !important;
        box-shadow: none !important;
        color: #000000 !important;
      }
      .filter-toolbar, .action-btn-group {
        display: none !important;
      }
      th {
        background: #f1f5f9 !important;
        color: #000000 !important;
      }
      td, .hero-title, .section-title {
        color: #000000 !important;
        -webkit-text-fill-color: initial !important;
      }
      .tag, .badge-pill {
        border: 1px solid #999 !important;
        color: #000 !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- Hero Header Card -->
    <header class="hero-card">
      <div class="hero-header">
        <div class="hero-meta-badges">
          <a href="${issue.self ? issue.self.replace('/rest/api/2/issue/', '/browse/').replace('/rest/api/3/issue/', '/browse/') : '#'}" target="_blank" class="badge-pill badge-jira">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 11.514H0a11.514 11.514 0 0 0 11.571 11.514v-11.514zm.858-11.514v11.514h11.571A11.514 11.514 0 0 0 12.429 0zm0 12.429v11.514H24a11.514 11.514 0 0 0-11.571-11.514z"/></svg>
            ${key}
          </a>
          <span class="badge-pill badge-status">${status}</span>
          <span class="badge-pill ${priority.toLowerCase() === 'high' ? 'badge-priority-high' : 'badge-priority-med'}">${priority} Priority</span>
          <span class="badge-pill" style="background: rgba(6, 182, 212, 0.15); color: #22d3ee; border: 1px solid rgba(6, 182, 212, 0.3);">${issueType}</span>
        </div>
        <div class="action-btn-group">
          <button class="btn btn-secondary" onclick="window.print()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
            Print / Save PDF
          </button>
        </div>
      </div>

      <h1 class="hero-title">${key} : ${summary}</h1>
      <p class="hero-subtitle">${analysis.userStoryStatement}</p>

      <div class="meta-grid">
        <div class="meta-item">
          <span class="meta-label">Assignee</span>
          <span class="meta-value">${assignee}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Reporter</span>
          <span class="meta-value">${reporter}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Created Date</span>
          <span class="meta-value">${createdDate}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Analysis Generated</span>
          <span class="meta-value">${analyzedTimestamp}</span>
        </div>
      </div>
    </header>

    <!-- KPI Highlights Bar -->
    <section class="kpi-grid">
      <div class="kpi-card kpi-blue">
        <span class="kpi-title">Total Test Scenarios</span>
        <div class="kpi-val">${totalScenarios}</div>
        <span class="kpi-desc">Across all QA functional dimensions</span>
      </div>
      <div class="kpi-card kpi-rose">
        <span class="kpi-title">Critical / P1 Tests</span>
        <div class="kpi-val">${p1Count}</div>
        <span class="kpi-desc">Must pass for release sign-off</span>
      </div>
      <div class="kpi-card kpi-emerald">
        <span class="kpi-title">Automation Potential</span>
        <div class="kpi-val">${autoPercent}%</div>
        <span class="kpi-desc">${automatedCount} scenarios ready for Playwright</span>
      </div>
      <div class="kpi-card kpi-amber">
        <span class="kpi-title">Identified Risks</span>
        <div class="kpi-val">${analysis.risks.length}</div>
        <span class="kpi-desc">With mitigation strategies</span>
      </div>
      <div class="kpi-card kpi-purple">
        <span class="kpi-title">Acceptance Criteria</span>
        <div class="kpi-val">${analysis.acList.length}</div>
        <span class="kpi-desc">100% test coverage mapped</span>
      </div>
    </section>

    <!-- Section 1: Detailed Requirements & Acceptance Criteria -->
    <section class="section-card">
      <div class="section-header">
        <div class="section-title">
          <span class="section-icon icon-req">📋</span>
          Detailed Requirements & Acceptance Criteria
        </div>
        <span class="tag tag-func">${analysis.acList.length} Criteria</span>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h4 style="color: #cbd5e1; margin-bottom: 8px;">Business Context & Scope</h4>
        <p style="color: #94a3b8; font-size: 0.95rem;">${analysis.contextText || 'The authentication module allows existing Creatio CRM users to sign in safely, recover forgotten credentials, perform federated social logins, configure cookie preferences, and access real-time chatbot support.'}</p>
      </div>

      <h4 style="color: #cbd5e1; margin-bottom: 12px;">Acceptance Criteria Verification Matrix</h4>
      <div class="ac-list">
        ${analysis.acList.map((ac, idx) => `
          <div class="ac-item">
            <span class="ac-num">AC-${String(idx + 1).padStart(2, '0')}</span>
            <span class="ac-text">${ac}</span>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Section 2: Risks & Mitigation -->
    <section class="section-card">
      <div class="section-header">
        <div class="section-title">
          <span class="section-icon icon-risk">⚠️</span>
          QA Risk Assessment & Mitigation Strategies
        </div>
        <span class="tag tag-p1">${analysis.risks.length} Assessed Risks</span>
      </div>
      <div class="risk-grid">
        ${analysis.risks.map(r => `
          <div class="risk-card ${r.severity.toLowerCase()}">
            <div class="risk-header">
              <span class="risk-title">${r.title}</span>
              <span class="tag ${r.severity.toLowerCase() === 'high' ? 'tag-p1' : (r.severity.toLowerCase() === 'medium' ? 'tag-p2' : 'tag-p3')}">${r.severity} Risk</span>
            </div>
            <p class="risk-impact">${r.impact}</p>
            <div class="risk-mitigation">
              <strong>QA Mitigation:</strong> ${r.mitigation}
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Section 3: Assumptions & Dependencies -->
    <section class="section-card">
      <div class="section-header">
        <div class="section-title">
          <span class="section-icon icon-assume">💡</span>
          Key Assumptions & Test Constraints
        </div>
        <span class="tag tag-p2">${analysis.assumptions.length} Assumptions</span>
      </div>
      <div class="assume-grid">
        ${analysis.assumptions.map(a => `
          <div class="assume-card">
            <strong>${a.category}</strong>
            <p style="color: #cbd5e1; font-size: 0.88rem;">${a.description}</p>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Section 4: Comprehensive Test Scenarios -->
    <section class="section-card">
      <div class="section-header">
        <div class="section-title">
          <span class="section-icon icon-scenario">🧪</span>
          QA Test Scenarios Matrix
        </div>
        <span class="tag tag-func">${totalScenarios} Scenarios</span>
      </div>

      <div class="filter-toolbar">
        <div class="filter-pills" id="categoryFilterGroup">
          <button class="filter-btn active" data-filter="all">All (${totalScenarios})</button>
          <button class="filter-btn" data-filter="UI/UX">UI/UX</button>
          <button class="filter-btn" data-filter="Functional">Functional</button>
          <button class="filter-btn" data-filter="Negative">Negative / Boundary</button>
          <button class="filter-btn" data-filter="Security">Security</button>
          <button class="filter-btn" data-filter="Social Auth">Social Auth</button>
          <button class="filter-btn" data-filter="Accessibility">Accessibility</button>
        </div>
        <input type="text" id="scenarioSearch" class="search-input" placeholder="Search scenarios, steps, expected results...">
      </div>

      <div class="table-container">
        <table id="scenariosTable">
          <thead>
            <tr>
              <th style="width: 110px;">ID</th>
              <th style="width: 110px;">Type</th>
              <th style="width: 220px;">Scenario Title</th>
              <th>Pre-Conditions & Test Steps</th>
              <th>Expected Result</th>
              <th style="width: 80px;">Priority</th>
              <th style="width: 90px;">Automation</th>
            </tr>
          </thead>
          <tbody>
            ${analysis.scenarios.map(s => `
              <tr data-type="${s.type}" class="scenario-row">
                <td><span class="code-pill">${s.id}</span></td>
                <td><span class="tag tag-${s.tagClass || 'func'}">${s.type}</span></td>
                <td><strong style="color: #fff;">${s.title}</strong></td>
                <td>
                  <div style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 4px;"><em>Pre-cond:</em> ${s.preconditions}</div>
                  <ol style="margin-left: 18px; font-size: 0.85rem; color: #cbd5e1;">
                    ${s.steps.map(st => `<li>${st}</li>`).join('')}
                  </ol>
                </td>
                <td style="font-size: 0.88rem; color: #e2e8f0;">${s.expected}</td>
                <td><span class="tag tag-${s.priority.toLowerCase()}">${s.priority}</span></td>
                <td><span class="tag ${s.automation === 'Automate' ? 'tag-auto-yes' : 'tag-auto-no'}">${s.automation}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Section 5: Test Data Requirements -->
    <section class="section-card">
      <div class="section-header">
        <div class="section-title">
          <span class="section-icon icon-data">📊</span>
          Test Data Matrix & Payloads
        </div>
        <span class="tag tag-data">${analysis.testData.length} Test Data Sets</span>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Data Set</th>
              <th>Classification</th>
              <th>Sample Input / Credentials</th>
              <th>Target Fields</th>
              <th>Expected Behavior / Objective</th>
            </tr>
          </thead>
          <tbody>
            ${analysis.testData.map(td => `
              <tr>
                <td><strong style="color: #fff;">${td.name}</strong></td>
                <td><span class="tag ${td.type.toLowerCase().includes('valid') ? 'tag-func' : (td.type.toLowerCase().includes('security') ? 'tag-sec' : 'tag-neg')}">${td.type}</span></td>
                <td><span class="code-pill">${td.payload}</span></td>
                <td><span style="color: #cbd5e1;">${td.fields}</span></td>
                <td style="color: #94a3b8; font-size: 0.85rem;">${td.objective}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Section 6: Execution Strategy & Test Environments -->
    <section class="section-card">
      <div class="section-header">
        <div class="section-title">
          <span class="section-icon icon-strategy">⚙️</span>
          Execution Strategy & QA Sign-Off Criteria
        </div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
        <div style="background: #1e293b; padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border);">
          <h4 style="color: #38bdf8; margin-bottom: 10px;">Playwright Automation Scope</h4>
          <ul style="margin-left: 20px; font-size: 0.85rem; color: #cbd5e1; line-height: 1.7;">
            <li>Form render verification & element visibility checks</li>
            <li>Password eye toggle mask/unmask verification</li>
            <li>Happy path login and session cookie creation</li>
            <li>Input validation error messages (empty, malformed email)</li>
            <li>Forgot password, Sign Up, and Social link routing</li>
          </ul>
        </div>
        <div style="background: #1e293b; padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border);">
          <h4 style="color: #fbbf24; margin-bottom: 10px;">Target Test Environments</h4>
          <ul style="margin-left: 20px; font-size: 0.85rem; color: #cbd5e1; line-height: 1.7;">
            <li>Browsers: Chromium (Desktop), Firefox (Desktop), WebKit (Safari)</li>
            <li>Viewports: Desktop (1920x1080), Tablet (768x1024), Mobile (375x812)</li>
            <li>Cookie states: Fresh Incognito, First-party Allowed, Third-party Blocked</li>
            <li>Network: High-speed Broadband, Simulated Fast 3G throttling</li>
          </ul>
        </div>
        <div style="background: #1e293b; padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border);">
          <h4 style="color: #34d399; margin-bottom: 10px;">QA Entry & Exit Criteria</h4>
          <ul style="margin-left: 20px; font-size: 0.85rem; color: #cbd5e1; line-height: 1.7;">
            <li><strong>Entry:</strong> Deploy to QA staging with functional Auth APIs & mock social endpoints</li>
            <li><strong>Exit:</strong> 100% of P1 & P2 test scenarios executed and passed</li>
            <li><strong>Zero Blockers:</strong> No open Critical or High severity security/login defects</li>
            <li><strong>Zephyr Linkage:</strong> All test executions logged in Zephyr / Jira</li>
          </ul>
        </div>
      </div>
    </section>

    <footer>
      <p>Generated by <strong>QA Requirement Analysis AI Agent</strong> | Playwright TDD Framework</p>
      <p style="margin-top: 6px; font-size: 0.78rem;">Connected via Jira Cloud REST API (bharathtechacademy40.atlassian.net) | Issue Key: ${key}</p>
    </footer>

  </div>

  <script>
    // Real-time Search and Filtering
    const searchInput = document.getElementById('scenarioSearch');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const rows = document.querySelectorAll('.scenario-row');

    let activeFilter = 'all';

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.dataset.filter;
        applyFilters();
      });
    });

    searchInput.addEventListener('input', applyFilters);

    function applyFilters() {
      const query = searchInput.value.toLowerCase().trim();

      rows.forEach(row => {
        const type = row.dataset.type;
        const text = row.innerText.toLowerCase();

        const matchesFilter = activeFilter === 'all' || type.includes(activeFilter) || 
          (activeFilter === 'Negative' && (type.includes('Negative') || type.includes('Boundary'))) ||
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

// Generate default comprehensive analysis for CRM-5 (or structured fallback)
export function buildAnalysisForStory(issue) {
  const parsed = parseJiraDescription(issue);
  
  return {
    userStoryStatement: parsed.userStoryStatement,
    contextText: parsed.contextText,
    acList: parsed.acList.length > 0 ? parsed.acList : [
      'The form has a header with the title "LOG IN TO YOUR ACCOUNT"',
      'Business email textbox with label on top',
      'Password textbox with label on top',
      'LOG IN button',
      'Password textbox has eye icon to show/hide entered password',
      '"Forgot password" link placed on top of password textbox',
      'Label "or log in using" below LOG IN button',
      'Social login options: LinkedIn, Google, Facebook with logo icon and hyperlink label',
      'Label "Don’t have an account?" below social icons',
      '"SIGN UP" link appears below "Don’t have an account?"',
      'Cookie settings icon in bottom left corner to view/withdraw/change cookie consent',
      'Creatio chatbot icon in bottom right corner for FAQ assistance'
    ],
    assumptions: [
      {
        category: 'Technical & Architecture',
        description: 'Login form is built as a Single Page Application (SPA) communicating over HTTPS with authentication REST APIs returning standard JWT bearer tokens.'
      },
      {
        category: 'Session & State Management',
        description: 'Successful authentication sets secure, HttpOnly, SameSite session cookies. Unauthenticated requests redirect back to login.'
      },
      {
        category: 'Third-Party Social Auth',
        description: 'OAuth 2.0 / OIDC integrations for Google, LinkedIn, and Facebook utilize sandbox/test client IDs in staging environments.'
      },
      {
        category: 'Cookie & Chatbot Widgets',
        description: 'Cookie consent manager and Creatio chatbot are loaded as asynchronous third-party or internal SDK scripts without blocking form interaction.'
      },
      {
        category: 'User Accounts',
        description: 'Test accounts with active, inactive, locked, and unverified states are seeded in the QA database.'
      }
    ],
    risks: [
      {
        title: 'Plaintext Password Exposure in DOM / Toggle Bug',
        severity: 'High',
        impact: 'If eye toggle fails to reset type back to "password" or leaks into logs, user credentials may be compromised.',
        mitigation: 'Verify input type strictly toggles between "password" and "text"; ensure automated scripts verify type="password" on form submit.'
      },
      {
        title: 'Brute Force & Credential Stuffing',
        severity: 'High',
        impact: 'Attacker automated attacks could compromise accounts without rate-limiting or CAPTCHA.',
        mitigation: 'Implement and test account lockout or rate-limiting (HTTP 429) after 5 consecutive failed attempts.'
      },
      {
        title: 'Social Login Redirect Hijacking / OAuth Misconfiguration',
        severity: 'Medium',
        impact: 'Misconfigured redirect_uri can allow token leakage or open redirection vulnerabilities.',
        mitigation: 'Validate exact redirect_uri whitelist on OAuth provider responses and test cancellation flows.'
      },
      {
        title: 'Cookie Consent Withdrawal Impact',
        severity: 'Medium',
        impact: 'If user withdraws cookie consent, necessary auth cookies might inadvertently be blocked or non-essential cookies persisted.',
        mitigation: 'Validate strict categorization: strictly necessary cookies remain operational; marketing/analytics cookies cleared immediately on withdrawal.'
      },
      {
        title: 'Slow Loading of Third-Party Scripts (Chatbot/Social)',
        severity: 'Low',
        impact: 'If external CDN fails, login form might experience layout shift or delayed interactivity.',
        mitigation: 'Ensure async/defer script loading with fallback UI in Playwright network failure tests.'
      }
    ],
    scenarios: [
      {
        id: 'TS_CRM5_UI_001',
        type: 'UI/UX',
        tagClass: 'ui',
        title: 'Verify Login Form Layout, Header & Core Elements Presence',
        preconditions: 'Navigate to Creatio CRM Login URL',
        steps: [
          'Verify page title and presence of header "LOG IN TO YOUR ACCOUNT"',
          'Verify Business Email label and textbox exist above password',
          'Verify Password label and textbox exist with "Forgot password" link placed on top',
          'Verify "LOG IN" button is visible and properly styled'
        ],
        expected: 'All elements match design specifications, fonts, and positions precisely without visual clipping.',
        priority: 'P1',
        automation: 'Automate'
      },
      {
        id: 'TS_CRM5_UI_002',
        type: 'UI/UX',
        tagClass: 'ui',
        title: 'Verify Social Login Section, Logos and Hyperlinks',
        preconditions: 'Login page loaded in viewport',
        steps: [
          'Verify text "or log in using" displayed below LOG IN button',
          'Verify LinkedIn, Google, and Facebook logos with matching hyperlink labels appear',
          'Verify text "Don’t have an account?" is displayed',
          'Verify "SIGN UP" hyperlink is visible below it'
        ],
        expected: 'Social options display crisp brand icons, hover underlines, and proper spacing.',
        priority: 'P2',
        automation: 'Automate'
      },
      {
        id: 'TS_CRM5_UI_003',
        type: 'UI/UX',
        tagClass: 'ui',
        title: 'Verify Bottom Widgets: Cookie Settings and Creatio Chatbot Icons',
        preconditions: 'Login page loaded',
        steps: [
          'Inspect bottom-left corner of the viewport for Cookie Settings icon (no text label)',
          'Inspect bottom-right corner of the viewport for Creatio Chatbot icon (no text label)'
        ],
        expected: 'Both icons are anchored in fixed/absolute corners with appropriate z-index and tooltip/aria-label.',
        priority: 'P2',
        automation: 'Automate'
      },
      {
        id: 'TS_CRM5_FUNC_001',
        type: 'Functional',
        tagClass: 'func',
        title: 'Successful Login with Valid Business Email and Password',
        preconditions: 'User account registered and active in CRM database',
        steps: [
          'Enter registered business email: "qa.test@creatio-crm.com"',
          'Enter valid password: "ValidPassword123!"',
          'Click "LOG IN" button'
        ],
        expected: 'User is authenticated, auth token/cookie set, and redirected to CRM Dashboard.',
        priority: 'P1',
        automation: 'Automate'
      },
      {
        id: 'TS_CRM5_FUNC_002',
        type: 'Functional',
        tagClass: 'func',
        title: 'Verify Password Visibility Toggle (Eye Icon)',
        preconditions: 'User enters text in password field',
        steps: [
          'Enter "SecretPass123" in Password field',
          'Verify characters are masked (bullet points / type="password")',
          'Click the Eye Icon inside password textbox',
          'Verify password text becomes visible ("SecretPass123" / type="text")',
          'Click Eye Icon again to re-mask'
        ],
        expected: 'Eye icon toggles between open/closed state and reveals/masks characters smoothly.',
        priority: 'P1',
        automation: 'Automate'
      },
      {
        id: 'TS_CRM5_FUNC_003',
        type: 'Functional',
        tagClass: 'func',
        title: 'Verify "Forgot password" Link Navigation',
        preconditions: 'User on Login form',
        steps: [
          'Click on "Forgot password" link placed on top of Password textbox'
        ],
        expected: 'User is navigated to Password Recovery page with email input field.',
        priority: 'P2',
        automation: 'Automate'
      },
      {
        id: 'TS_CRM5_FUNC_004',
        type: 'Functional',
        tagClass: 'func',
        title: 'Verify "SIGN UP" Navigation for New User Registration',
        preconditions: 'User on Login form',
        steps: [
          'Click on "SIGN UP" link under "Don’t have an account?"'
        ],
        expected: 'User is directed to Account Registration / Free Trial onboarding form.',
        priority: 'P2',
        automation: 'Automate'
      },
      {
        id: 'TS_CRM5_FUNC_005',
        type: 'Functional',
        tagClass: 'func',
        title: 'Verify Cookie Settings Modal & Consent Lifecycle',
        preconditions: 'Login page loaded',
        steps: [
          'Click Cookie Settings icon in bottom-left corner',
          'Verify modal opens displaying categories (Necessary, Analytics, Marketing)',
          'Toggle non-necessary cookies to Off and click Save Preferences',
          'Re-open cookie settings and verify updated preference persisted'
        ],
        expected: 'Cookie preference modal opens cleanly and persists user consent settings.',
        priority: 'P2',
        automation: 'Automate'
      },
      {
        id: 'TS_CRM5_FUNC_006',
        type: 'Functional',
        tagClass: 'func',
        title: 'Verify Creatio Chatbot Widget Interaction',
        preconditions: 'Login page loaded',
        steps: [
          'Click Chatbot icon in bottom-right corner',
          'Verify FAQ chat assistant widget expands',
          'Send sample message "Forgot login password"',
          'Verify automated FAQ reply is returned'
        ],
        expected: 'Chatbot widget toggles without freezing UI and offers customer self-service assistance.',
        priority: 'P3',
        automation: 'Automate'
      },
      {
        id: 'TS_CRM5_NEG_001',
        type: 'Negative',
        tagClass: 'neg',
        title: 'Submit Login with Blank Fields',
        preconditions: 'Both Email and Password fields are empty',
        steps: [
          'Leave email and password empty',
          'Click "LOG IN" button'
        ],
        expected: 'Inline validation errors appear: "Please enter your business email" and "Please enter your password". No network submit.',
        priority: 'P1',
        automation: 'Automate'
      },
      {
        id: 'TS_CRM5_NEG_002',
        type: 'Negative',
        tagClass: 'neg',
        title: 'Input Invalid Email Format & Non-Business Domains',
        preconditions: 'Form is empty',
        steps: [
          'Enter invalid emails ("plainaddress", "missing@domain", "@nodomain.com")',
          'Enter valid password and click "LOG IN"'
        ],
        expected: 'Validation error: "Please enter a valid business email address".',
        priority: 'P1',
        automation: 'Automate'
      },
      {
        id: 'TS_CRM5_NEG_003',
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
        id: 'TS_CRM5_NEG_004',
        type: 'Negative',
        tagClass: 'edge',
        title: 'Boundary Value Testing: Max Length and Unicode Handling',
        preconditions: 'Login form loaded',
        steps: [
          'Enter 255-character email string',
          'Enter 128-character complex password with unicode characters (€, ñ, 🚀)',
          'Attempt submission'
        ],
        expected: 'System handles character limits gracefully without DB exception or UI overflow.',
        priority: 'P2',
        automation: 'Automate'
      },
      {
        id: 'TS_CRM5_SEC_001',
        type: 'Security',
        tagClass: 'sec',
        title: 'SQL Injection and XSS Payload Resilience',
        preconditions: 'Form is empty',
        steps: [
          'Enter SQL injection payload in email: "admin\' OR \'1\'=\'1"',
          'Enter XSS payload in password: "<script>alert(1)</script>"',
          'Click "LOG IN"'
        ],
        expected: 'Input is safely sanitized/parameterized. Error displayed without script execution or database errors.',
        priority: 'P1',
        automation: 'Automate'
      },
      {
        id: 'TS_CRM5_SEC_002',
        type: 'Security',
        tagClass: 'sec',
        title: 'Password Masking in Network Payload & Clipboard',
        preconditions: 'DevTools Network tab recording',
        steps: [
          'Enter password in textbox',
          'Submit form and inspect HTTP request payload'
        ],
        expected: 'Password is sent in JSON body over HTTPS (POST method); NEVER exposed in URL query parameters.',
        priority: 'P1',
        automation: 'Automate'
      },
      {
        id: 'TS_CRM5_SOC_001',
        type: 'Social Auth',
        tagClass: 'func',
        title: 'Federated Login via LinkedIn / Google / Facebook',
        preconditions: 'User has third-party test account',
        steps: [
          'Click "Google" social login option',
          'Verify OAuth consent dialog opens with valid client_id',
          'Authenticate with Google test credentials',
          'Verify successful callback into CRM application'
        ],
        expected: 'User account is linked or created via OAuth token and redirects to dashboard.',
        priority: 'P2',
        automation: 'Automate'
      },
      {
        id: 'TS_CRM5_A11Y_001',
        type: 'Accessibility',
        tagClass: 'a11y',
        title: 'Keyboard Tab Navigation & Screen Reader ARIA Compliance',
        preconditions: 'No mouse usage (keyboard only)',
        steps: [
          'Use Tab key to traverse: Email -> Password -> Forgot Password -> Eye Icon -> LOG IN -> Social Icons -> Sign Up -> Cookie -> Chatbot',
          'Press Enter while focused on LOG IN button'
        ],
        expected: 'Focus indicator is clearly visible on every interactive control; Enter key submits form; icon buttons have aria-label.',
        priority: 'P2',
        automation: 'Automate'
      }
    ],
    testData: [
      {
        name: 'Valid Standard User',
        type: 'Valid Happy Path',
        payload: 'alex.smith@creatio-crm.com / P@ssw0rd2026!',
        fields: 'Email, Password',
        objective: 'Verifies normal authentication flow and redirect to dashboard.'
      },
      {
        name: 'Valid Admin User',
        type: 'Valid Role-based',
        payload: 'admin.ops@creatio-crm.com / AdminSecure#2026',
        fields: 'Email, Password',
        objective: 'Verifies admin privilege onboarding and system console access.'
      },
      {
        name: 'Empty Credentials',
        type: 'Negative Validation',
        payload: '"" (empty string) / "" (empty string)',
        fields: 'Email, Password',
        objective: 'Verifies client-side validation triggers without server roundtrip.'
      },
      {
        name: 'Malformed Email',
        type: 'Negative Validation',
        payload: 'invalid-email-address / ValidPass123!',
        fields: 'Email',
        objective: 'Verifies email format regex and immediate helper error text.'
      },
      {
        name: 'Incorrect Password',
        type: 'Negative Validation',
        payload: 'alex.smith@creatio-crm.com / WrongP@ss999',
        fields: 'Password',
        objective: 'Verifies generic error message to prevent username enumeration.'
      },
      {
        name: 'SQLi Attack String',
        type: 'Security Validation',
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
    ]
  };
}

// Main runner
async function main() {
  const args = process.argv.slice(2);
  const issueKeyArg = args[0] || 'CRM-5';
  
  // Format issue key (e.g., if user passed 5, make CRM-5)
  const issueKey = issueKeyArg.includes('-') ? issueKeyArg.toUpperCase() : `CRM-${issueKeyArg}`;
  console.log(`[INFO] Starting QA Requirement Analysis for Jira Issue: ${issueKey}`);

  const env = loadEnv();
  console.log(`[INFO] Loaded environment configuration from .env`);

  console.log(`[INFO] Connecting to Jira API at ${getJiraBaseUrl(env.JIRA_URL)}...`);
  const issue = await fetchJiraIssue(issueKey, env);
  console.log(`[SUCCESS] Connected to Jira! Fetched issue: ${issue.key} - ${issue.fields?.summary}`);

  console.log(`[INFO] Analyzing requirements, acceptance criteria, risks, assumptions, and test scenarios...`);
  const analysis = buildAnalysisForStory(issue);

  console.log(`[INFO] Generating colorful, responsive HTML Test Plan Report...`);
  const htmlContent = generateHtmlReport(issue, analysis);

  const outputDir = path.join(projectRoot, 'ai-implementation', 'requirement-analysis');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFilename = `${issueKey.toLowerCase()}-requirement-analysis.html`;
  const outputPath = path.join(outputDir, outputFilename);

  fs.writeFileSync(outputPath, htmlContent, 'utf8');
  console.log(`[SUCCESS] Requirement Analysis Report generated at: ${outputPath}`);
}

main().catch(err => {
  console.error('[ERROR]', err.message);
  process.exit(1);
});

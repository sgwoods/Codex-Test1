#!/usr/bin/env node
const fs = require('fs');
const https = require('https');
const { execFileSync } = require('child_process');
const {
  DEV_BUILD_INFO,
  BETA_BUILD_INFO,
  PRODUCTION_BUILD_INFO
} = require('./paths');

const OWNER = process.env.AURORA_PUBLIC_OWNER || 'sgwoods';
const REPO = process.env.AURORA_PUBLIC_REPO || 'Aurora-Galactica';
const DEFAULT_BRANCH = process.env.AURORA_PUBLIC_BRANCH || 'main';
const PAGES_WORKFLOW_NAME = process.env.AURORA_PUBLIC_PAGES_WORKFLOW || 'Deploy Pages';

function parseArgs(argv){
  const args = {};
  for(let i = 0; i < argv.length; i++){
    const token = argv[i];
    if(!token.startsWith('--')) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if(!next || next.startsWith('--')){
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

function laneConfig(lane){
  if(lane === 'dev'){
    return {
      buildInfo: DEV_BUILD_INFO,
      url: 'https://sgwoods.github.io/Aurora-Galactica/dev/build-info.json',
      repoBuildInfoUrl: `https://raw.githubusercontent.com/${OWNER}/${REPO}/${DEFAULT_BRANCH}/dev/build-info.json`,
      repo: {
        owner: OWNER,
        name: REPO,
        branch: DEFAULT_BRANCH,
        workflowName: PAGES_WORKFLOW_NAME
      },
      assetUrls: [
        'https://sgwoods.github.io/Aurora-Galactica/dev/conformance-dashboard.html',
        'https://sgwoods.github.io/Aurora-Galactica/dev/conformance-dashboard-data.json',
        'https://sgwoods.github.io/Aurora-Galactica/dev/application-guide.html',
        'https://sgwoods.github.io/Aurora-Galactica/dev/releases.html',
        'https://sgwoods.github.io/Aurora-Galactica/dev/white-paper.html',
        'https://sgwoods.github.io/Aurora-Galactica/dev/white-paper.pdf',
        'https://sgwoods.github.io/Aurora-Galactica/dev/white-paper-pdf.json',
        'https://sgwoods.github.io/Aurora-Galactica/dev/public-project-page.html',
        'https://sgwoods.github.io/Aurora-Galactica/dev/assets/platinum-platform-mark.png',
        'https://sgwoods.github.io/Aurora-Galactica/dev/assets/reference-audio/galaga3-start.m4a'
      ]
    };
  }
  if(lane === 'beta'){
    return {
      buildInfo: BETA_BUILD_INFO,
      url: 'https://sgwoods.github.io/Aurora-Galactica/beta/build-info.json',
      repoBuildInfoUrl: `https://raw.githubusercontent.com/${OWNER}/${REPO}/${DEFAULT_BRANCH}/beta/build-info.json`,
      repo: {
        owner: OWNER,
        name: REPO,
        branch: DEFAULT_BRANCH,
        workflowName: PAGES_WORKFLOW_NAME
      },
      assetUrls: [
        'https://sgwoods.github.io/Aurora-Galactica/beta/conformance-dashboard.html',
        'https://sgwoods.github.io/Aurora-Galactica/beta/conformance-dashboard-data.json',
        'https://sgwoods.github.io/Aurora-Galactica/beta/application-guide.html',
        'https://sgwoods.github.io/Aurora-Galactica/beta/releases.html',
        'https://sgwoods.github.io/Aurora-Galactica/beta/white-paper.html',
        'https://sgwoods.github.io/Aurora-Galactica/beta/white-paper.pdf',
        'https://sgwoods.github.io/Aurora-Galactica/beta/white-paper-pdf.json',
        'https://sgwoods.github.io/Aurora-Galactica/beta/public-project-page.html',
        'https://sgwoods.github.io/Aurora-Galactica/beta/assets/platinum-platform-mark.png',
        'https://sgwoods.github.io/Aurora-Galactica/beta/assets/reference-audio/galaga3-start.m4a'
      ]
    };
  }
  if(lane === 'production'){
    return {
      buildInfo: PRODUCTION_BUILD_INFO,
      url: 'https://sgwoods.github.io/Aurora-Galactica/build-info.json',
      repoBuildInfoUrl: `https://raw.githubusercontent.com/${OWNER}/${REPO}/${DEFAULT_BRANCH}/build-info.json`,
      repo: {
        owner: OWNER,
        name: REPO,
        branch: DEFAULT_BRANCH,
        workflowName: PAGES_WORKFLOW_NAME
      },
      assetUrls: [
        'https://sgwoods.github.io/Aurora-Galactica/conformance-dashboard.html',
        'https://sgwoods.github.io/Aurora-Galactica/conformance-dashboard-data.json',
        'https://sgwoods.github.io/Aurora-Galactica/application-guide.html',
        'https://sgwoods.github.io/Aurora-Galactica/white-paper.html',
        'https://sgwoods.github.io/Aurora-Galactica/white-paper.pdf',
        'https://sgwoods.github.io/Aurora-Galactica/white-paper-pdf.json',
        'https://sgwoods.github.io/Aurora-Galactica/public-project-page.html',
        'https://sgwoods.github.io/Aurora-Galactica/assets/platinum-platform-mark.png',
        'https://sgwoods.github.io/Aurora-Galactica/assets/reference-audio/galaga3-start.m4a'
      ]
    };
  }
  throw new Error('Use --lane dev, --lane beta, or --lane production.');
}

function sleep(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function run(cmd, args){
  const out = execFileSync(cmd, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  return typeof out === 'string' ? out.trim() : '';
}

function logProgress(message){
  console.error(`[verify-live-lane] ${message}`);
}

function armRequestTimeout(req, res, url, timeoutMs){
  const fail = () => req.destroy(new Error(`Request timeout after ${timeoutMs}ms for ${url}`));
  req.setTimeout(timeoutMs, fail);
  if(res && typeof res.setTimeout === 'function'){
    res.setTimeout(timeoutMs, fail);
  }
}

function fetchJson(url, requestTimeoutMs){
  return new Promise((resolve, reject) => {
    const req = https.get(url, res => {
      armRequestTimeout(req, res, url, requestTimeoutMs);
      if(res.statusCode !== 200){
        reject(new Error(`HTTP ${res.statusCode} from ${url}`));
        res.resume();
        return;
      }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try{
          resolve(JSON.parse(body));
        }catch(err){
          reject(new Error(`Could not parse JSON from ${url}: ${err.message}`));
        }
      });
    });
    armRequestTimeout(req, null, url, requestTimeoutMs);
    req.on('error', reject);
  });
}

function fetchOk(url, requestTimeoutMs){
  return new Promise((resolve, reject) => {
    const req = https.get(url, res => {
      armRequestTimeout(req, res, url, requestTimeoutMs);
      const status = res.statusCode || 0;
      res.resume();
      if(status === 200){
        resolve(true);
        return;
      }
      reject(new Error(`HTTP ${status} from ${url}`));
    });
    armRequestTimeout(req, null, url, requestTimeoutMs);
    req.on('error', reject);
  });
}

function ghJson(path){
  const text = run('gh', ['api', path]);
  return JSON.parse(text);
}

function tryGhJson(path){
  try{
    return ghJson(path);
  }catch{
    return null;
  }
}

function shortCommit(value){
  return String(value || '').slice(0, 8);
}

function matchesExpected(live, expected){
  return (
    live &&
    live.label === expected.label &&
    live.commit === expected.commit &&
    live.releaseChannel === expected.releaseChannel
  );
}

async function inspectPagesWorkflowState(cfg, expected, requestTimeoutMs){
  const repoBuildInfo = await fetchJson(cfg.repoBuildInfoUrl, requestTimeoutMs);
  const repoMatchesExpected = matchesExpected(repoBuildInfo, expected);
  const state = {
    repoRef: `${cfg.repo.owner}/${cfg.repo.name}`,
    branch: cfg.repo.branch,
    repoBuildInfoUrl: cfg.repoBuildInfoUrl,
    repoMatchesExpected,
    repoBuildInfo: repoBuildInfo ? {
      label: repoBuildInfo.label,
      commit: shortCommit(repoBuildInfo.commit || repoBuildInfo.shortCommit),
      releaseChannel: repoBuildInfo.releaseChannel
    } : null,
    pagesBuildType: null,
    headSha: null,
    workflow: null
  };
  if(!repoMatchesExpected){
    return state;
  }

  const pages = tryGhJson(`repos/${cfg.repo.owner}/${cfg.repo.name}/pages`);
  state.pagesBuildType = pages?.build_type || null;
  if(state.pagesBuildType !== 'workflow'){
    return state;
  }

  const branchInfo = tryGhJson(`repos/${cfg.repo.owner}/${cfg.repo.name}/branches/${encodeURIComponent(cfg.repo.branch)}`);
  const headSha = branchInfo?.commit?.sha || null;
  state.headSha = shortCommit(headSha);

  const runsResp = tryGhJson(`repos/${cfg.repo.owner}/${cfg.repo.name}/actions/runs?per_page=25`);
  const deployRuns = Array.isArray(runsResp?.workflow_runs)
    ? runsResp.workflow_runs.filter(run => run.name === cfg.repo.workflowName)
    : [];
  const matchingHeadRuns = headSha
    ? deployRuns.filter(run => run.head_sha === headSha)
    : [];
  const activeRun = matchingHeadRuns.find(run => run.status !== 'completed') || null;
  const latestRun = matchingHeadRuns[0] || null;
  const selectedRun = activeRun || latestRun;
  if(selectedRun){
    state.workflow = {
      id: selectedRun.id,
      event: selectedRun.event,
      status: selectedRun.status,
      conclusion: selectedRun.conclusion,
      headSha: shortCommit(selectedRun.head_sha),
      htmlUrl: selectedRun.html_url || null,
      createdAt: selectedRun.created_at || null
    };
  }
  return state;
}

function dispatchPagesWorkflow(cfg){
  run('gh', [
    'workflow',
    'run',
    cfg.repo.workflowName,
    '-R',
    `${cfg.repo.owner}/${cfg.repo.name}`,
    '--ref',
    cfg.repo.branch
  ]);
}

async function main(){
  const args = parseArgs(process.argv.slice(2));
  const lane = String(args.lane || '').toLowerCase();
  const cfg = laneConfig(lane);
  const timeoutMs = Math.max(10_000, +args.timeoutMs || 180_000);
  const requestTimeoutMs = Math.min(timeoutMs, Math.max(5_000, +args.requestTimeoutMs || 15_000));
  const intervalMs = Math.max(2_000, +args.intervalMs || 8_000);
  const expected = loadJson(cfg.buildInfo);
  const deadline = Date.now() + timeoutMs;
  let lastSeen = null;
  let lastError = null;
  const workflowRepair = {
    attempted: false,
    dispatched: false,
    state: null,
    lastReason: null,
    lastNotice: null
  };

  while(Date.now() < deadline){
    try{
      logProgress(`checking ${lane} build-info: ${cfg.url}`);
      const live = await fetchJson(cfg.url, requestTimeoutMs);
      lastSeen = live;
      if(matchesExpected(live, expected)){
        const assetUrls = cfg.assetUrls || [];
        for(const [index, assetUrl] of assetUrls.entries()){
          logProgress(`checking ${lane} asset ${index + 1}/${assetUrls.length}: ${assetUrl}`);
          try{
            await fetchOk(assetUrl, requestTimeoutMs);
          }catch(err){
            throw new Error(`Asset verification failed for ${assetUrl}: ${err.message || String(err)}`);
          }
        }
        console.log(JSON.stringify({
          ok: true,
          lane,
          url: cfg.url,
          assetUrls: cfg.assetUrls || [],
          label: live.label,
          commit: live.shortCommit || String(live.commit || '').slice(0, 7),
          releaseChannel: live.releaseChannel
        }, null, 2));
        return;
      }
      lastError = `live ${lane} build-info does not match expected artifact yet`;
    }catch(err){
      lastError = err.message || String(err);
    }

    try{
      const state = await inspectPagesWorkflowState(cfg, expected, requestTimeoutMs);
      workflowRepair.state = state;
      if(!state.repoMatchesExpected){
        workflowRepair.lastReason = 'public repo build-info has not reached the expected artifact yet';
      } else if(state.pagesBuildType !== 'workflow'){
        workflowRepair.lastReason = state.pagesBuildType
          ? `pages build type is ${state.pagesBuildType}; no workflow self-heal needed`
          : 'pages build type could not be determined';
      } else if(state.workflow && state.workflow.status !== 'completed'){
        const notice = `waiting for ${cfg.repo.workflowName} run ${state.workflow.id} (${state.workflow.status})`;
        if(workflowRepair.lastNotice !== notice){
          logProgress(notice);
          workflowRepair.lastNotice = notice;
        }
        workflowRepair.lastReason = 'pages workflow already running for current hosted repo head';
      } else if(state.workflow && state.workflow.conclusion === 'success'){
        workflowRepair.lastReason = 'pages workflow already completed for current hosted repo head; waiting for live Pages update';
      } else if(!workflowRepair.attempted){
        logProgress(
          `live ${lane} Pages content is stale while ${state.repoBuildInfoUrl} already matches expected; dispatching ${cfg.repo.workflowName} for ${state.repoRef}@${state.branch}`
        );
        dispatchPagesWorkflow(cfg);
        workflowRepair.attempted = true;
        workflowRepair.dispatched = true;
        workflowRepair.lastNotice = null;
        workflowRepair.lastReason = `dispatched ${cfg.repo.workflowName} manually`;
      }
    }catch(err){
      if(!workflowRepair.lastReason){
        workflowRepair.lastReason = `Pages workflow self-heal inspection failed: ${err.message || String(err)}`;
      }
    }

    await sleep(intervalMs);
  }

  throw new Error(JSON.stringify({
    ok: false,
    lane,
    url: cfg.url,
    expected: {
      label: expected.label,
      commit: expected.shortCommit || String(expected.commit || '').slice(0, 7),
      releaseChannel: expected.releaseChannel
    },
    requestTimeoutMs,
    lastSeen: lastSeen ? {
      label: lastSeen.label,
      commit: lastSeen.shortCommit || String(lastSeen.commit || '').slice(0, 7),
      releaseChannel: lastSeen.releaseChannel
    } : null,
    lastError,
    pagesWorkflowSelfHeal: {
      attempted: workflowRepair.attempted,
      dispatched: workflowRepair.dispatched,
      lastReason: workflowRepair.lastReason,
      state: workflowRepair.state ? {
        repoRef: workflowRepair.state.repoRef,
        branch: workflowRepair.state.branch,
        repoBuildInfoUrl: workflowRepair.state.repoBuildInfoUrl,
        repoMatchesExpected: workflowRepair.state.repoMatchesExpected,
        repoBuildInfo: workflowRepair.state.repoBuildInfo,
        pagesBuildType: workflowRepair.state.pagesBuildType,
        headSha: workflowRepair.state.headSha,
        workflow: workflowRepair.state.workflow
      } : null
    }
  }, null, 2));
}

main().catch(err => {
  console.error(err.message || err);
  process.exit(1);
});

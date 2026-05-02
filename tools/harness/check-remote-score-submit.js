#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const path = require('path');
const { launchHarnessBrowser } = require('./browser-launch');
const { DIST_DEV } = require('../build/paths');

const APP_ROOT = DIST_DEV;

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function mime(file){
  if(file.endsWith('.html')) return 'text/html; charset=utf-8';
  if(file.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if(file.endsWith('.json')) return 'application/json; charset=utf-8';
  if(file.endsWith('.png')) return 'image/png';
  if(file.endsWith('.webm')) return 'video/webm';
  if(file.endsWith('.css')) return 'text/css; charset=utf-8';
  return 'application/octet-stream';
}

function serve(root = APP_ROOT){
  const server = http.createServer((req, res) => {
    const clean = decodeURIComponent((req.url || '/').split('?')[0]);
    const rel = clean === '/' ? '/index.html' : clean;
    const file = path.resolve(root, '.' + rel);
    if(!file.startsWith(root)) return res.writeHead(403).end('forbidden');
    fs.readFile(file, (err, data) => {
      if(err) return res.writeHead(404).end('not found');
      res.writeHead(200, { 'content-type': mime(file), 'cache-control': 'no-store' });
      res.end(data);
    });
  });
  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

async function open(page, port){
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(200);
}

async function runSuccessCase(page){
  return page.evaluate(async () => {
    await window.__galagaHarness__.setupRemoteScoreSubmitTest({
      mode: 'success',
      userId: 'pilot-score-submit',
      email: 'pilot@example.com',
      initials: 'SGW'
    });
    window.__galagaHarness__.triggerRemoteScoreGameOver({ score: 76770, stage: 12 });
    await new Promise(resolve => setTimeout(resolve, 80));
    return window.__galagaHarness__.remoteScoreSubmitState();
  });
}

async function runFailureCase(page){
  return page.evaluate(async () => {
    await window.__galagaHarness__.setupRemoteScoreSubmitTest({
      mode: 'failure',
      errorMessage: 'Harness remote submit failed',
      userId: 'pilot-score-submit',
      email: 'pilot@example.com',
      initials: 'SGW'
    });
    window.__galagaHarness__.triggerRemoteScoreGameOver({ score: 88888, stage: 9 });
    await new Promise(resolve => setTimeout(resolve, 120));
    document.getElementById('feedbackDockBtn')?.click();
    await new Promise(resolve => setTimeout(resolve, 20));
    const prefill = {
      summary: fbSummary.value || '',
      description: fbDescription.value || ''
    };
    window.__auroraFeedbackPayload = null;
    window.fetch = async (_url, options) => {
      window.__auroraFeedbackPayload = Object.fromEntries(Array.from(options.body.entries()));
      return {
        ok: true,
        status: 200,
        headers: { get: name => name.toLowerCase() === 'content-type' ? 'application/json' : '' },
        json: async () => ({ success: true })
      };
    };
    if(!fbSummary.value.trim()) fbSummary.value = 'Online score save failed';
    if(!fbDescription.value.trim()) fbDescription.value = 'Harness-triggered remote score failure.';
    feedbackForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await new Promise(resolve => setTimeout(resolve, 80));
    return {
      prefill,
      state: window.__galagaHarness__.remoteScoreSubmitState(),
      feedbackPayload: window.__auroraFeedbackPayload
    };
  });
}

async function main(){
  if(!fs.existsSync(path.join(APP_ROOT, 'index.html'))){
    throw new Error(`Built dev app not found at ${APP_ROOT}. Run "npm run build" first.`);
  }

  const { server, port } = await serve(APP_ROOT);
  const browser = await launchHarnessBrowser();

  try{
    const context = await browser.newContext({ viewport: { width: 1440, height: 1600 } });
    const successPage = await context.newPage();
    await open(successPage, port);
    const success = await runSuccessCase(successPage);
    if((success.calls || []).length !== 1){
      fail('remote score submit should run once immediately on game over for locked signed-in pilots', success);
    }
    if((success.calls[0]?.score|0) !== 76770 || (success.calls[0]?.stage|0) !== 12){
      fail('remote score submit payload lost the expected score or stage', success);
    }
    if(success.remoteSubmitted !== 1){
      fail('successful remote score submit should mark the game-over state as submitted', success);
    }

    const failurePage = await context.newPage();
    await open(failurePage, port);
    const failure = await runFailureCase(failurePage);
    const failedEntry = (failure.state.systemLog || []).find(entry => entry.action === 'score_submit_failed');
    if(!failedEntry){
      fail('failed remote score submit should be persisted in the local system log', failure);
    }
    if(!/online score save failed/i.test(failure.prefill.summary || '')){
      fail('failed remote score submit should prefill the bug-report summary', failure);
    }
    const payload = failure.feedbackPayload || {};
    const logged = JSON.parse(payload.system_log || '[]');
    if(!logged.some(entry => entry.action === 'score_submit_failed')){
      fail('feedback submission should include recent system-log diagnostics', failure);
    }
    if(!/Recent system log:/i.test(payload.message || '')){
      fail('feedback payload should include the formatted recent system log', failure);
    }

    console.log(JSON.stringify({
      ok: true,
      success: {
        calls: success.calls,
        remoteSubmitted: success.remoteSubmitted,
        leaderboardStatus: success.leaderboardStatus
      },
      failure: {
        summary: failure.state.summary,
        leaderboardStatus: failure.state.leaderboardStatus,
        failedAction: failedEntry.action
      }
    }, null, 2));

    await context.close();
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch(err => fail(err && err.stack || String(err)));

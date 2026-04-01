#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright-core');
const { DIST_DEV } = require('../build/paths');

const APP_ROOT = DIST_DEV;
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

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

async function prepareFeedback(page){
  await page.evaluate(() => {
    localStorage.removeItem('neo_galaga_system_log');
    document.getElementById('feedbackDockBtn')?.click();
    fbType.value = 'bug_report';
    fbSummary.value = 'Harness feedback path';
    fbDescription.value = 'Harness feedback path verification with diagnostics attached.';
  });
  await page.waitForTimeout(80);
}

async function runSuccessCase(page){
  return page.evaluate(async () => {
    window.__auroraFeedbackCapture = { calls: [], fallback: null };
    window.__auroraOpenMailFallbackOverride = (subject, lines) => {
      window.__auroraFeedbackCapture.fallback = { subject, lines };
    };
    window.fetch = async (_url, options) => {
      const entries = Array.from(options.body.entries());
      window.__auroraFeedbackCapture.calls.push(Object.fromEntries(entries));
      return {
        ok: true,
        status: 200,
        headers: { get: name => name.toLowerCase() === 'content-type' ? 'application/json' : '' },
        json: async () => ({ success: true })
      };
    };
    feedbackForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      capture: window.__auroraFeedbackCapture,
      status: document.getElementById('feedbackStatus')?.textContent || '',
      summary: fbSummary.value || '',
      description: fbDescription.value || ''
    };
  });
}

async function runFailureCase(page){
  return page.evaluate(async () => {
    window.__auroraFeedbackCapture = { calls: [], fallback: null };
    window.__auroraOpenMailFallbackOverride = (subject, lines) => {
      window.__auroraFeedbackCapture.fallback = { subject, lines };
    };
    window.fetch = async (_url, options) => {
      const entries = Array.from(options.body.entries());
      window.__auroraFeedbackCapture.calls.push(Object.fromEntries(entries));
      return {
        ok: false,
        status: 521,
        headers: { get: () => 'text/plain; charset=utf-8' },
        text: async () => 'error code: 521'
      };
    };
    feedbackForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      capture: window.__auroraFeedbackCapture,
      status: document.getElementById('feedbackStatus')?.textContent || '',
      systemLog: typeof recentSystemLogEntries === 'function' ? recentSystemLogEntries(20) : []
    };
  });
}

async function main(){
  if(!fs.existsSync(CHROME)) throw new Error(`Chrome not found at ${CHROME}`);
  if(!fs.existsSync(path.join(APP_ROOT, 'index.html'))){
    throw new Error(`Built dev app not found at ${APP_ROOT}. Run "npm run build" first.`);
  }

  const { server, port } = await serve(APP_ROOT);
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--autoplay-policy=no-user-gesture-required']
  });

  try{
    const context = await browser.newContext({ viewport: { width: 1440, height: 1600 } });

    const successPage = await context.newPage();
    await open(successPage, port);
    await prepareFeedback(successPage);
    const success = await runSuccessCase(successPage);
    if((success.capture.calls || []).length !== 1){
      fail('feedback direct-send happy path should perform one FormSubmit request', success);
    }
    if(success.capture.fallback){
      fail('feedback direct-send happy path should not open the fallback mail draft', success);
    }
    const sent = success.capture.calls[0] || {};
    if(!/Harness feedback path/i.test(sent.title || '')){
      fail('feedback direct-send path lost the bug-report title', success);
    }
    if(!/Recent system log:/i.test(sent.message || '')){
      fail('feedback direct-send payload should include formatted diagnostics', success);
    }
    if(success.summary || success.description){
      fail('feedback form should clear after a successful direct send', success);
    }

    const failurePage = await context.newPage();
    await open(failurePage, port);
    await prepareFeedback(failurePage);
    const failure = await runFailureCase(failurePage);
    if((failure.capture.calls || []).length !== 1){
      fail('feedback failure path should still attempt one direct FormSubmit request first', failure);
    }
    if(!failure.capture.fallback){
      fail('feedback failure path should open the fallback mail draft', failure);
    }
    if(!/direct send could not complete/i.test(failure.status || '')){
      fail('feedback failure path should explain that direct send failed and fallback opened', failure);
    }
    if(!(failure.systemLog || []).some(entry => entry.action === 'feedback_submit_failed')){
      fail('feedback failure path should persist diagnostics in the local system log', failure);
    }

    console.log(JSON.stringify({
      ok: true,
      success: {
        title: sent.title,
        status: success.status
      },
      failure: {
        status: failure.status,
        fallbackSubject: failure.capture.fallback?.subject || '',
        loggedFailure: (failure.systemLog || []).find(entry => entry.action === 'feedback_submit_failed') || null
      }
    }, null, 2));

    await context.close();
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch(err => fail(err && err.stack || String(err)));

#!/usr/bin/env node
const { withHarnessPage, sleep } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({
    stage: 3,
    ships: 3,
    seed: 45017
  }, async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', err => pageErrors.push(String(err && err.message || err)));

    await page.evaluate(() => window.armRuntimeLoopCrash('draw'));

    await sleep(250);

    return await page.evaluate(pageErrorsSeen => {
      const systemLog = typeof window.recentSystemLogEntries === 'function' ? window.recentSystemLogEntries(20) : [];
      const crash = systemLog.find(entry => entry.action === 'runtime_loop_crash');
      const state = window.__galagaHarness__.state();
      return {
        pageErrorsSeen,
        msg: document.getElementById('msg')?.textContent || '',
        paused: state.paused,
        started: state.started,
        crash,
        systemLogCount: systemLog.length
      };
    }, pageErrors);
  });

  if(result.pageErrorsSeen.length) fail('runtime loop crash bubbled to an unhandled page error', result);
  if(!result.crash) fail('runtime loop crash was not recorded in the system log', result);
  if(result.crash.data?.phase !== 'draw') fail('runtime loop crash did not preserve the failing phase', result);
  if(!String(result.msg || '').includes('Press X to export diagnostics')) fail('runtime loop crash did not surface the export guidance', result);
  if(!result.paused) fail('runtime loop crash did not pause the run', result);
  if(!result.started) fail('runtime loop crash unexpectedly ended the run instead of preserving state', result);

  console.log(JSON.stringify({
    ok: true,
    paused: result.paused,
    started: result.started,
    msg: result.msg,
    crash: result.crash
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

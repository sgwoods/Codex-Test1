#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, details = {}){
  console.error(JSON.stringify({ ok: false, message, ...details }, null, 2));
  process.exit(1);
}

(async () => {
  const result = await withHarnessPage({
    skipStart: true,
    seed: 73101,
    viewport: { width: 1280, height: 900 }
  }, async ({ page }) => {
    return page.evaluate(() => {
      const api = window.__platinumFullscreen;
      if(!api) return { hasApi: false };
      const before = api.state();
      api.setAuto(true, { source: 'harness', log: false });
      api.setMode(true, { source: 'harness', requestBrowserFullscreen: false });
      if(typeof draw === 'function')draw();
      const active = {
        state: api.state(),
        bodyClass: document.body.classList.contains('arcadeFullscreenActive'),
        shellDisplay: getComputedStyle(document.getElementById('cabinetShell')).display,
        leftRailDisplay: getComputedStyle(document.getElementById('cabinetLeftFrame')).display,
        rightRailDisplay: getComputedStyle(document.getElementById('cabinetRightFrame')).display,
        frameRect: document.getElementById('playfieldFrame').getBoundingClientRect()
      };
      api.setMode(false, { source: 'harness', exitBrowser: false });
      if(typeof draw === 'function')draw();
      const inactive = {
        state: api.state(),
        bodyClass: document.body.classList.contains('arcadeFullscreenActive'),
        shellDisplay: getComputedStyle(document.getElementById('cabinetShell')).display,
        leftRailDisplay: getComputedStyle(document.getElementById('cabinetLeftFrame')).display,
        rightRailDisplay: getComputedStyle(document.getElementById('cabinetRightFrame')).display,
        frameRect: document.getElementById('playfieldFrame').getBoundingClientRect()
      };
      return { hasApi: true, before, active, inactive };
    });
  });

  if(!result.hasApi) fail('Arcade fullscreen API is not exposed.', result);
  if(result.before.auto !== true) fail('Arcade fullscreen should default auto-on.', result);
  if(!result.active.state.active || !result.active.bodyClass) fail('Arcade fullscreen active mode did not set layout state.', result);
  if(result.active.shellDisplay !== 'none' || result.active.leftRailDisplay !== 'none' || result.active.rightRailDisplay !== 'none'){
    fail('Arcade fullscreen active mode should hide cabinet shell and rails.', result);
  }
  if(result.active.frameRect.width < 680 || result.active.frameRect.height < 860){
    fail('Arcade fullscreen active mode did not expand the playfield enough for review.', result);
  }
  if(result.inactive.state.active || result.inactive.bodyClass) fail('Arcade fullscreen did not return to console state.', result);
  if(result.inactive.shellDisplay === 'none') fail('Console state should restore the cabinet shell.', result);

  console.log(JSON.stringify({ ok: true, result }, null, 2));
})().catch(err => {
  fail('Arcade fullscreen check crashed.', { error: String(err?.stack || err) });
});

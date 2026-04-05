#!/usr/bin/env node
const path = require('path');
const { withHarnessPage } = require('./browser-check-util');

const ARTIFACT_DIR = '/tmp';
const TOLERANCE = 3;

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function inside(frame, rect, tolerance = TOLERANCE){
  return rect.left >= frame.left - tolerance &&
    rect.top >= frame.top - tolerance &&
    rect.right <= frame.right + tolerance &&
    rect.bottom <= frame.bottom + tolerance;
}

async function inspectSurface(page, spec){
  await page.locator(spec.open).click();
  await page.waitForTimeout(240);
  try{
    await page.waitForFunction(current => {
      const panel = document.querySelector(current.panel);
      const frame = document.getElementById('playfieldFrame');
      const close = document.querySelector(current.close);
      if(!panel) return false;
      if(!frame || !close) return false;
      const style = getComputedStyle(panel);
      if(panel.hidden || style.display === 'none' || style.visibility === 'hidden') return false;
      const panelRect = panel.getBoundingClientRect();
      const frameRect = frame.getBoundingClientRect();
      const closeRect = close.getBoundingClientRect();
      return panelRect.width > 0 &&
        panelRect.height > 0 &&
        closeRect.width > 0 &&
        panelRect.left >= frameRect.left - 6 &&
        panelRect.right <= frameRect.right + 6 &&
        panelRect.top >= frameRect.top - 6 &&
        panelRect.bottom <= frameRect.bottom + 6;
    }, spec, { timeout: 2200 });
  }catch(err){
    fail(`${spec.name} popup did not open`, { open: spec.open, panel: spec.panel, close: spec.close, error: String(err && err.message || err) });
  }
  const result = await page.evaluate(current => {
    const frame = document.getElementById('playfieldFrame');
    const panel = document.querySelector(current.panel);
    const close = document.querySelector(current.close);
    if(!frame || !panel || !close) return null;
    const panelStyle = getComputedStyle(panel);
    const closeStyle = getComputedStyle(close);
    const frameRect = frame.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const closeRect = close.getBoundingClientRect();
    const extra = current.captureHelpTab ? { activeTab: document.querySelector('[data-help-tab].active')?.dataset.helpTab || '' } : {};
    return {
      name: current.name,
      frameRect: {
        left: frameRect.left,
        top: frameRect.top,
        right: frameRect.right,
        bottom: frameRect.bottom,
        width: frameRect.width,
        height: frameRect.height
      },
      panelRect: {
        left: panelRect.left,
        top: panelRect.top,
        right: panelRect.right,
        bottom: panelRect.bottom,
        width: panelRect.width,
        height: panelRect.height
      },
      closeRect: {
        left: closeRect.left,
        top: closeRect.top,
        right: closeRect.right,
        bottom: closeRect.bottom,
        width: closeRect.width,
        height: closeRect.height
      },
      closeVisible: closeStyle.display !== 'none' && closeStyle.visibility !== 'hidden' && closeRect.width > 0 && closeRect.height > 0,
      extra
    };
  }, spec);

  const screenshot = path.join(ARTIFACT_DIR, `aurora-popup-surface-${spec.name}.png`);
  await page.screenshot({ path: screenshot });
  result.screenshot = screenshot;

  if(result.panelRect.width < 120 || result.panelRect.height < 80){
    fail(`${spec.name} popup did not render at a usable size`, result);
  }
  if(!inside(result.frameRect, result.panelRect)){
    fail(`${spec.name} popup overflowed the gameplay frame`, result);
  }
  if(!inside(result.panelRect, result.closeRect, 1)){
    fail(`${spec.name} dismiss button is not placed inside the popup surface`, result);
  }
  if(!result.closeVisible){
    fail(`${spec.name} dismiss button is not visible`, result);
  }

  if(spec.expectedHelpTab && result.extra.activeTab !== spec.expectedHelpTab){
    fail(`${spec.name} popup did not open on the ${spec.expectedHelpTab} tab`, result);
  }

  await page.locator(spec.close).click();
  await page.waitForTimeout(180);
  const closed = await page.evaluate(selector => {
    const panel = document.querySelector(selector);
    if(!panel) return false;
    const style = getComputedStyle(panel);
    return panel.hidden || style.display === 'none' || style.visibility === 'hidden' || panel.getAttribute('aria-hidden') === 'true';
  }, spec.closedSelector || spec.panel);
  if(!closed){
    fail(`${spec.name} popup did not close from its dismiss button`, result);
  }

  return result;
}

async function main(){
  const specs = [
    {
      name: 'game-picker',
      open: '#gamePickerDockBtn',
      panel: '#gamePickerPanel',
      close: '#gamePickerClose',
      closedSelector: '#gamePickerModal'
    },
    {
      name: 'platform',
      open: '#platformSplashBtn',
      panel: '#platformSplashPanel',
      close: '#platformSplashClose',
      closedSelector: '#platformSplashModal'
    },
    {
      name: 'settings',
      open: '#settingsBtn',
      panel: '#settingsPanel',
      close: '#settingsPanelClose'
    },
    {
      name: 'pilot',
      open: '#accountDockBtn',
      panel: '#accountPanel',
      close: '#accountPanelClose'
    },
    {
      name: 'movie',
      open: '#movieDockBtn',
      panel: '#moviePanel',
      close: '#moviePanelClose',
      closedSelector: '#movieModal'
    },
    {
      name: 'scores',
      open: '#leaderboardDockBtn',
      panel: '#leaderboardPanel',
      close: '#leaderboardPanelClose'
    },
    {
      name: 'guide',
      open: '#guideDockBtn',
      panel: '#helpPanel',
      close: '#helpClose',
      closedSelector: '#helpModal',
      captureHelpTab: true,
      expectedHelpTab: 'guide'
    },
    {
      name: 'controls',
      open: '#controlsDockBtn',
      panel: '#helpPanel',
      close: '#helpClose',
      closedSelector: '#helpModal',
      captureHelpTab: true,
      expectedHelpTab: 'controls'
    },
    {
      name: 'feedback',
      open: '#feedbackDockBtn',
      panel: '#feedbackPanel',
      close: '#feedbackClose',
      closedSelector: '#feedbackModal'
    }
  ];

  const results = await withHarnessPage({ stage: 2, ships: 3, challenge: false, seed: 49027 }, async ({ page }) => {
    await page.keyboard.press('KeyP');
    await page.waitForTimeout(180);
    const collected = [];
    for(const spec of specs){
      collected.push(await inspectSurface(page, spec));
    }
    return collected;
  });

  console.log(JSON.stringify({ ok: true, checked: results }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

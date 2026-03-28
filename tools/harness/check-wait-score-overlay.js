#!/usr/bin/env node
const { withHarnessPage, waitForHarness } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 2, ships: 3, challenge: false, seed: 9047 }, async ({ page }) => {
    await page.evaluate(() => window.__galagaHarness__.openWaitLeaderboard('all'));
    return waitForHarness(page, () => {
      const statusPanels = document.getElementById('statusPanels');
      const leaderboardPanel = document.getElementById('leaderboardPanel');
      const leaderboardViews = document.getElementById('leaderboardViews');
      const buttons = document.getElementById('leaderboardViewButtons');
      const frame = document.getElementById('playfieldFrame');
      if(!statusPanels || !leaderboardPanel || !leaderboardViews || !buttons || !frame) return null;
      if(!statusPanels.classList.contains('waitOverlay')) return null;
      if(leaderboardPanel.hidden) return null;
      const rect = statusPanels.getBoundingClientRect();
      const frameRect = frame.getBoundingClientRect();
      const buttonsStyle = getComputedStyle(buttons);
      const viewsStyle = getComputedStyle(leaderboardViews);
      return {
        waitOverlay: true,
        rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
        frameRect: { left: frameRect.left, top: frameRect.top, width: frameRect.width, height: frameRect.height },
        buttonsFlexDirection: buttonsStyle.flexDirection,
        viewsDisplay: viewsStyle.display
      };
    }, 1800, 50);
  });

  const center = result.rect.left + result.rect.width / 2;
  const frameCenter = result.frameRect.left + result.frameRect.width / 2;
  if(Math.abs(center - frameCenter) > 8){
    fail('wait-mode score overlay is no longer centered over the playfield', result);
  }
  if(result.rect.width > 424){
    fail('wait-mode score overlay grew wider than the intended compact overlay size', result);
  }
  if(result.rect.top < result.frameRect.top + 40){
    fail('wait-mode score overlay sits too high and risks colliding with the HUD band', result);
  }
  if(result.buttonsFlexDirection !== 'column'){
    fail('wait-mode score view buttons are no longer stacked vertically in overlay mode', result);
  }
  if(result.viewsDisplay !== 'flex'){
    fail('wait-mode score view panel did not remain visible in overlay mode', result);
  }

  console.log(JSON.stringify({
    ok: true,
    rect: result.rect,
    frameRect: result.frameRect,
    buttonsFlexDirection: result.buttonsFlexDirection
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

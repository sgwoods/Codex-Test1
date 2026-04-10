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
      if(!statusPanels.classList.contains('framedOverlay')) return null;
      if(leaderboardPanel.hidden) return null;
      const rect = statusPanels.getBoundingClientRect();
      const frameRect = frame.getBoundingClientRect();
      const buttonsStyle = getComputedStyle(buttons);
      const viewsStyle = getComputedStyle(leaderboardViews);
      return {
        framedOverlay: true,
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
    fail('wait-mode leaderboard overlay is no longer centered over the playfield', result);
  }
  if(result.rect.width < 600 || result.rect.width > 960){
    fail('wait-mode leaderboard overlay no longer matches the intended framed overlay width', result);
  }
  if(result.rect.top > result.frameRect.top + 24){
    fail('wait-mode leaderboard overlay dropped too low inside the playfield frame', result);
  }
  if(result.buttonsFlexDirection !== 'row'){
    fail('wait-mode score view buttons are no longer laid out horizontally in framed overlay mode', result);
  }
  if(result.viewsDisplay !== 'flex'){
    fail('wait-mode score view panel did not remain visible in framed overlay mode', result);
  }

  console.log(JSON.stringify({
    ok: true,
    rect: result.rect,
    frameRect: result.frameRect,
    buttonsFlexDirection: result.buttonsFlexDirection
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

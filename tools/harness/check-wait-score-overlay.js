#!/usr/bin/env node
const { withHarnessPage, waitForHarness } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 2, ships: 3, challenge: false, seed: 9047 }, async ({ page }) => {
    await page.evaluate(() => {
      const rows = Array.from({ length: 10 }, (_, index) => ({
        id: `fit-score-${index + 1}`,
        initials: ['SGW', 'KJE', 'YOU', 'DKA', 'ROL', 'ROB', 'AAA', 'BBB', 'CCC', 'DDD'][index],
        score: [126960, 122670, 87070, 76770, 61170, 45620, 45610, 44650, 33150, 32480][index],
        stage: Math.max(1, 14 - index),
        build: ['1.3.0', '1.2.3', '1.0.2', '1.0.0'][index % 4],
        at: `2026-05-${String(Math.max(1, 10 - index)).padStart(2, '0')}T12:00:00.000Z`
      }));
      window.__galagaHarness__.seedLocalLeaderboard(rows);
      window.__galagaHarness__.openWaitLeaderboard('local');
    });
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
      const panelRect = leaderboardPanel.getBoundingClientRect();
      const viewsRect = leaderboardViews.getBoundingClientRect();
      const scoreCells = Array.from(leaderboardPanel.querySelectorAll('.scoreCell'));
      const lastScoreCell = scoreCells[scoreCells.length - 1] || null;
      const lastScoreRect = lastScoreCell ? lastScoreCell.getBoundingClientRect() : null;
      const buttonsStyle = getComputedStyle(buttons);
      const viewsStyle = getComputedStyle(leaderboardViews);
      return {
        framedOverlay: true,
        viewport: { width: window.innerWidth, height: window.innerHeight },
        rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
        frameRect: { left: frameRect.left, top: frameRect.top, width: frameRect.width, height: frameRect.height },
        panelRect: { left: panelRect.left, top: panelRect.top, width: panelRect.width, height: panelRect.height, bottom: panelRect.bottom },
        viewsRect: { left: viewsRect.left, top: viewsRect.top, width: viewsRect.width, height: viewsRect.height, bottom: viewsRect.bottom },
        scoreCellCount: scoreCells.length,
        lastScoreRect: lastScoreRect ? { left: lastScoreRect.left, right: lastScoreRect.right, top: lastScoreRect.top, bottom: lastScoreRect.bottom } : null,
        lastScoreBottom: lastScoreRect ? lastScoreRect.bottom : 0,
        leaderboardClientHeight: leaderboardPanel.clientHeight,
        leaderboardScrollHeight: leaderboardPanel.scrollHeight,
        statusClientHeight: statusPanels.clientHeight,
        statusScrollHeight: statusPanels.scrollHeight,
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
  if(result.rect.top < -2 || result.rect.top + result.rect.height > result.viewport.height + 2){
    fail('wait-mode leaderboard overlay requires browser-window scrolling to see the full score panel', result);
  }
  if(result.buttonsFlexDirection !== 'row'){
    fail('wait-mode score view buttons are no longer laid out horizontally in framed overlay mode', result);
  }
  if(result.viewsDisplay !== 'flex'){
    fail('wait-mode score view panel did not remain visible in framed overlay mode', result);
  }
  if(result.scoreCellCount < 50){
    fail('wait-mode leaderboard did not render the full top-10 score grid', result);
  }
  if(result.leaderboardScrollHeight > result.leaderboardClientHeight + 2){
    fail('wait-mode leaderboard requires internal scrolling to see the full top-10 grid', result);
  }
  if(result.statusScrollHeight > result.statusClientHeight + 2){
    fail('wait-mode leaderboard plus score controls overflow the framed overlay footprint', result);
  }
  if(result.viewsRect.bottom > result.frameRect.top + result.frameRect.height + 4){
    fail('wait-mode score view controls escaped below the playfield frame', result);
  }
  if(result.lastScoreBottom > result.panelRect.bottom + 2){
    fail('wait-mode leaderboard final row is clipped below the score panel', result);
  }
  if(result.lastScoreBottom > result.viewsRect.top - 2){
    fail('wait-mode leaderboard final row is hidden behind score view controls', result);
  }
  if(result.lastScoreRect && result.lastScoreRect.right > result.panelRect.left + result.panelRect.width - 2){
    fail('wait-mode leaderboard final column is clipped past the score panel edge', result);
  }

  console.log(JSON.stringify({
    ok: true,
    viewport: result.viewport,
    rect: result.rect,
    frameRect: result.frameRect,
    panelRect: result.panelRect,
    viewsRect: result.viewsRect,
    buttonsFlexDirection: result.buttonsFlexDirection,
    leaderboardScrollHeight: result.leaderboardScrollHeight,
    leaderboardClientHeight: result.leaderboardClientHeight
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

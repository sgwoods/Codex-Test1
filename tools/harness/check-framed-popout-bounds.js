#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

const TOLERANCE = 4;

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function closeEnough(a, b, tolerance = TOLERANCE){
  return Math.abs(a - b) <= tolerance;
}

function rectInside(outer, inner, tolerance = TOLERANCE){
  return inner.left >= outer.left - tolerance &&
    inner.top >= outer.top - tolerance &&
    inner.right <= outer.right + tolerance &&
    inner.bottom <= outer.bottom + tolerance;
}

function sameFootprint(a, b, tolerance = TOLERANCE){
  return closeEnough(a.left, b.left, tolerance) &&
    closeEnough(a.top, b.top, tolerance) &&
    closeEnough(a.width, b.width, tolerance) &&
    closeEnough(a.height, b.height, tolerance);
}

async function readState(page){
  return page.evaluate(() => {
    const box = el => {
      if(!el) return null;
      const rect = el.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height
      };
    };
    const visible = selector => {
      const el = document.querySelector(selector);
      if(!el) return false;
      const style = getComputedStyle(el);
      return !el.hidden && style.display !== 'none' && style.visibility !== 'hidden' && box(el).width > 0 && box(el).height > 0;
    };
    const scoreCells = Array.from(document.querySelectorAll('#leaderboardPanelTable .scoreCell'));
    const lastScoreCell = scoreCells[scoreCells.length - 1] || null;
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      frame: box(document.getElementById('playfieldFrame')),
      statusPanels: box(document.getElementById('statusPanels')),
      settingsPanel: box(document.getElementById('settingsPanel')),
      accountPanel: box(document.getElementById('accountPanel')),
      leaderboardPanel: box(document.getElementById('leaderboardPanel')),
      leaderboardViews: box(document.getElementById('leaderboardViews')),
      platformMessagePanel: box(document.getElementById('platformMessagePanel')),
      feedbackModal: box(document.getElementById('feedbackModal')),
      helpModal: box(document.getElementById('helpModal')),
      gamePickerModal: box(document.getElementById('gamePickerModal')),
      leaderboardScoreCellCount: scoreCells.length,
      leaderboardLastScoreCell: box(lastScoreCell),
      leaderboardClientHeight: document.getElementById('leaderboardPanel')?.clientHeight || 0,
      leaderboardScrollHeight: document.getElementById('leaderboardPanel')?.scrollHeight || 0,
      statusPanelsClientHeight: document.getElementById('statusPanels')?.clientHeight || 0,
      statusPanelsScrollHeight: document.getElementById('statusPanels')?.scrollHeight || 0,
      settingsOpen: visible('#settingsPanel'),
      accountOpen: visible('#accountPanel'),
      leaderboardOpen: visible('#leaderboardPanel'),
      platformMessagesOpen: visible('#platformMessagePanel'),
      feedbackOpen: document.getElementById('feedbackModal')?.classList.contains('open') || false,
      helpOpen: document.getElementById('helpModal')?.classList.contains('open') || false,
      gamePickerOpen: document.getElementById('gamePickerModal')?.classList.contains('open') || false
    };
  });
}

function assertFramedStatus(name, state, baseline){
  if(!state.frame || !state.statusPanels) fail(`${name} did not expose frame geometry`, state);
  if(!rectInside(state.frame, state.statusPanels)){
    fail(`${name} status overlay escaped the gameplay frame`, state);
  }
  if(!baseline) return state.statusPanels;
  if(!sameFootprint(baseline, state.statusPanels)){
    fail(`${name} did not reuse the same framed overlay footprint`, { baseline, state });
  }
  return baseline;
}

async function main(){
  const result = await withHarnessPage({
    skipStart: true,
    viewport: { width: 673, height: 810 },
    seed: 49033
  }, async ({ page }) => {
    await page.waitForTimeout(250);
    await page.evaluate(() => {
      const rows = Array.from({ length: 10 }, (_, index) => ({
        id: `framed-score-${index + 1}`,
        initials: ['SGW', 'KJE', 'YOU', 'DKA', 'ROL', 'ROB', 'AAA', 'BBB', 'CCC', 'DDD'][index],
        score: [126960, 122670, 87070, 76770, 61170, 45620, 45610, 44650, 33150, 32480][index],
        stage: Math.max(1, 14 - index),
        build: ['1.3.0', '1.2.3', '1.0.2', '1.0.0'][index % 4],
        at: `2026-05-${String(Math.max(1, 10 - index)).padStart(2, '0')}T12:00:00.000Z`
      }));
      if(window.__galagaHarness__) window.__galagaHarness__.seedLocalLeaderboard(rows);
      if(typeof draw === 'function') draw();
    });

    const states = {};
    let baseline = null;

    await page.locator('#buildStamp').click();
    await page.waitForTimeout(180);
    states.platformMessages = await readState(page);
    baseline = assertFramedStatus('platform messages', states.platformMessages, baseline);
    if(!states.platformMessages.platformMessagesOpen || states.platformMessages.leaderboardOpen || states.platformMessages.accountOpen){
      fail('platform messages did not open as the only framed status popout', states.platformMessages);
    }

    await page.locator('#leaderboardDockBtn').click();
    await page.waitForTimeout(180);
    await page.locator('#leaderboardViewButtons button[data-view="local"]').click();
    await page.waitForTimeout(180);
    states.leaderboard = await readState(page);
    baseline = assertFramedStatus('leaderboard', states.leaderboard, baseline);
    if(states.leaderboard.platformMessagesOpen || !states.leaderboard.leaderboardOpen || states.leaderboard.accountOpen){
      fail('leaderboard did not replace the existing framed popout cleanly', states.leaderboard);
    }
    if(states.leaderboard.leaderboardScoreCellCount < 50){
      fail('leaderboard framed popout did not render the full top-10 score grid', states.leaderboard);
    }
    if(states.leaderboard.leaderboardScrollHeight > states.leaderboard.leaderboardClientHeight + TOLERANCE){
      fail('leaderboard framed popout requires internal scrolling to see all score rows', states.leaderboard);
    }
    if(states.leaderboard.statusPanelsScrollHeight > states.leaderboard.statusPanelsClientHeight + TOLERANCE){
      fail('leaderboard framed popout and score controls overflow the framed overlay footprint', states.leaderboard);
    }
    if(states.leaderboard.statusPanels.top < -TOLERANCE || states.leaderboard.statusPanels.bottom > states.leaderboard.viewport.height + TOLERANCE){
      fail('leaderboard framed popout requires browser-window scrolling to see the full score panel', states.leaderboard);
    }
    if(states.leaderboard.leaderboardLastScoreCell && states.leaderboard.leaderboardViews && states.leaderboard.leaderboardLastScoreCell.bottom > states.leaderboard.leaderboardViews.top - TOLERANCE){
      fail('leaderboard framed popout hides the final score row behind score view controls', states.leaderboard);
    }
    if(states.leaderboard.leaderboardLastScoreCell && states.leaderboard.leaderboardPanel && states.leaderboard.leaderboardLastScoreCell.right > states.leaderboard.leaderboardPanel.right - TOLERANCE){
      fail('leaderboard framed popout clips the final score column past the panel edge', states.leaderboard);
    }
    if(states.leaderboard.leaderboardViews && !rectInside(states.leaderboard.frame, states.leaderboard.leaderboardViews)){
      fail('leaderboard score view controls escaped the gameplay frame', states.leaderboard);
    }

    await page.locator('#accountDockBtn').click();
    await page.waitForTimeout(180);
    states.account = await readState(page);
    baseline = assertFramedStatus('account', states.account, baseline);
    if(states.account.platformMessagesOpen || states.account.leaderboardOpen || !states.account.accountOpen){
      fail('account panel did not replace the existing framed popout cleanly', states.account);
    }

    await page.locator('#feedbackDockBtn').click();
    await page.waitForTimeout(180);
    states.feedback = await readState(page);
    if(states.feedback.accountOpen || states.feedback.leaderboardOpen || states.feedback.platformMessagesOpen || !states.feedback.feedbackOpen){
      fail('feedback popout did not close the framed status popout before opening', states.feedback);
    }
    if(!rectInside(states.feedback.frame, states.feedback.feedbackModal)){
      fail('feedback modal container escaped the gameplay frame', states.feedback);
    }

    await page.locator('#guideDockBtn').click();
    await page.waitForTimeout(180);
    states.guide = await readState(page);
    if(states.guide.feedbackOpen || !states.guide.helpOpen){
      fail('guide popout did not replace feedback cleanly', states.guide);
    }
    if(!rectInside(states.guide.frame, states.guide.helpModal)){
      fail('guide modal container escaped the gameplay frame', states.guide);
    }

    await page.locator('#settingsBtn').click();
    await page.waitForTimeout(180);
    states.settings = await readState(page);
    if(states.settings.helpOpen || !states.settings.settingsOpen){
      fail('settings popout did not replace guide cleanly', states.settings);
    }
    if(!rectInside(states.settings.frame, states.settings.settingsPanel)){
      fail('settings panel escaped the gameplay frame', states.settings);
    }

    await page.locator('#gamePickerDockBtn').click();
    await page.waitForTimeout(180);
    states.gamePicker = await readState(page);
    if(states.gamePicker.settingsOpen || !states.gamePicker.gamePickerOpen){
      fail('game picker popout did not replace settings cleanly', states.gamePicker);
    }
    if(!rectInside(states.gamePicker.frame, states.gamePicker.gamePickerModal)){
      fail('game picker modal container escaped the gameplay frame', states.gamePicker);
    }

    return states;
  });

  console.log(JSON.stringify({ ok: true, result }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 1, ships: 3, challenge: false, seed: 49031 }, async ({ page }) => {
    await page.locator('#accountDockBtn').click();
    await page.waitForTimeout(150);
    const afterPilot = await page.evaluate(() => ({
      accountOpen: !document.getElementById('accountPanel')?.hidden,
      leaderboardOpen: !document.getElementById('leaderboardPanel')?.hidden,
      feedbackOpen: document.getElementById('feedbackModal')?.classList.contains('open') || false
    }));

    await page.locator('#leaderboardDockBtn').click();
    await page.waitForTimeout(150);
    const afterScores = await page.evaluate(() => ({
      accountOpen: !document.getElementById('accountPanel')?.hidden,
      leaderboardOpen: !document.getElementById('leaderboardPanel')?.hidden,
      feedbackOpen: document.getElementById('feedbackModal')?.classList.contains('open') || false
    }));

    await page.locator('#feedbackDockBtn').click();
    await page.waitForTimeout(150);
    const afterFeedback = await page.evaluate(() => ({
      accountOpen: !document.getElementById('accountPanel')?.hidden,
      leaderboardOpen: !document.getElementById('leaderboardPanel')?.hidden,
      feedbackOpen: document.getElementById('feedbackModal')?.classList.contains('open') || false
    }));

    await page.locator('#accountDockBtn').click();
    await page.waitForTimeout(150);
    const afterPilotReturn = await page.evaluate(() => ({
      accountOpen: !document.getElementById('accountPanel')?.hidden,
      leaderboardOpen: !document.getElementById('leaderboardPanel')?.hidden,
      feedbackOpen: document.getElementById('feedbackModal')?.classList.contains('open') || false
    }));

    return { afterPilot, afterScores, afterFeedback, afterPilotReturn };
  });

  if(!result.afterPilot.accountOpen || result.afterPilot.leaderboardOpen || result.afterPilot.feedbackOpen){
    fail('pilot information did not open as the only active overlay', result);
  }
  if(result.afterScores.accountOpen || !result.afterScores.leaderboardOpen || result.afterScores.feedbackOpen){
    fail('switching from pilot information to high scores did not dismiss the previous overlay cleanly', result);
  }
  if(result.afterFeedback.accountOpen || result.afterFeedback.leaderboardOpen || !result.afterFeedback.feedbackOpen){
    fail('switching from high scores to feedback did not dismiss the previous overlay cleanly', result);
  }
  if(!result.afterPilotReturn.accountOpen || result.afterPilotReturn.leaderboardOpen || result.afterPilotReturn.feedbackOpen){
    fail('switching back into pilot information did not dismiss the previous overlay cleanly', result);
  }

  console.log(JSON.stringify({ ok: true, result }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

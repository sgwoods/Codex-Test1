#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 1, ships: 3, seed: 53193 }, async ({ page }) => {
    await page.evaluate(async () => {
      const createdAt = new Date(Date.now() - 90 * 1000).toISOString();
      window.__galagaHarness__.seedLocalLeaderboard([
        { id: 'trophy-score-local', initials: 'YOU', score: 543210, stage: 5, at: createdAt, build: '1.3.0' },
        { id: 'trophy-score-backup', initials: 'ACE', score: 120000, stage: 3, at: new Date(Date.now() - 300000).toISOString(), build: '1.3.0' }
      ]);
      await window.__galagaHarness__.seedLocalReplay({
        id: 'trophy-replay-local',
        clearExisting: true,
        initials: 'YOU',
        pilotInitials: 'YOU',
        score: 543210,
        stage: 5,
        duration: 71,
        createdAt
      });
      if(typeof window.refreshMovieCatalog === 'function') await window.refreshMovieCatalog({ silent: 1 });
      window.__galagaHarness__.openWaitLeaderboard('local');
      window.__auroraPlayCalls = 0;
      const video = document.getElementById('movieVideo');
      if(video && !video.__auroraTrophyPlayWrapped){
        const basePlay = video.play.bind(video);
        video.play = (...args) => {
          window.__auroraPlayCalls = (window.__auroraPlayCalls || 0) + 1;
          return basePlay(...args);
        };
        video.__auroraTrophyPlayWrapped = true;
      }
    });
    await page.waitForTimeout(250);

    const replayButtonCount = await page.locator('#leaderboardPanelTable .leaderboardReplayBtn').count();
    const replayButtonText = replayButtonCount ? await page.locator('#leaderboardPanelTable .leaderboardReplayBtn').first().textContent() : '';
    const replayMetaCount = await page.locator('#leaderboardPanelTable .scoreCell.meta.hasReplay').count();
    if(replayButtonCount) await page.locator('#leaderboardPanelTable .leaderboardReplayBtn').first().click();
    await page.waitForTimeout(350);
    const replayState = await page.evaluate(() => ({
      replayButtonCount: document.querySelectorAll('#leaderboardPanelTable .leaderboardReplayBtn').length,
      replayButtonText: (document.querySelector('#leaderboardPanelTable .leaderboardReplayBtn')?.textContent || '').trim(),
      replayMetaCount: document.querySelectorAll('#leaderboardPanelTable .scoreCell.meta.hasReplay').length,
      movieOpen: typeof window.isMoviePanelOpen === 'function' ? !!window.isMoviePanelOpen() : false,
      movieReady: document.getElementById('moviePanel')?.classList.contains('ready') || false,
      selectedReplay: document.getElementById('movieRunSelect')?.value || '',
      leaderboardClosed: !!document.getElementById('leaderboardPanel')?.hidden,
      playCalls: window.__auroraPlayCalls || 0
    }));

    await page.evaluate(() => {
      if(typeof window.closeMoviePanel === 'function') window.closeMoviePanel(1);
      window.__galagaHarness__.openWaitLeaderboard('local');
    });
    await page.waitForTimeout(120);
    if(replayMetaCount) await page.locator('#leaderboardPanelTable .scoreCell.meta.hasReplay').first().click();
    await page.waitForTimeout(350);
    const replayMetaState = await page.evaluate(() => ({
      movieOpen: typeof window.isMoviePanelOpen === 'function' ? !!window.isMoviePanelOpen() : false,
      movieReady: document.getElementById('moviePanel')?.classList.contains('ready') || false,
      selectedReplay: document.getElementById('movieRunSelect')?.value || '',
      leaderboardClosed: !!document.getElementById('leaderboardPanel')?.hidden,
      playCalls: window.__auroraPlayCalls || 0
    }));

    await page.evaluate(() => {
      if(typeof window.closeMoviePanel === 'function') window.closeMoviePanel(1);
      window.__galagaHarness__.setupUnsignedTopScoreTest();
      window.__galagaHarness__.triggerRemoteScoreGameOver({
        score: 1890,
        stage: 1,
        reserveLives: 0,
        shots: 12,
        hits: 7
      });
      window.__galagaHarness__.showGameOverScoreboard();
    });
    await page.waitForTimeout(100);
    const promptBefore = await page.evaluate(() => ({
      html: document.getElementById('msg')?.innerHTML || '',
      text: document.getElementById('msg')?.textContent?.replace(/\s+/g, ' ').trim() || '',
      buttonText: document.querySelector('#msg .gameOverAuthBtn')?.textContent?.trim() || '',
      topScoreSigninPrompt: window.__galagaHarness__.gameOverView().topScoreSigninPrompt
    }));
    await page.evaluate(() => {
      const button = document.querySelector('#msg .gameOverAuthBtn');
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
    await page.waitForTimeout(120);
    const promptAfter = await page.evaluate(() => ({
      accountOpen: !document.getElementById('accountPanel')?.hidden,
      accountSummary: document.getElementById('accountSummary')?.textContent?.trim() || '',
      events: (window.__galagaHarness__.recentEvents({ count: 50 }) || []).filter(event => event.type === 'top_score_signin_prompt_opened')
    }));

    return { replayButtonText, replayMetaCount, replayState, replayMetaState, promptBefore, promptAfter };
  });

  if(result.replayState.replayButtonCount < 1 || !/Replay/i.test(result.replayButtonText || result.replayState.replayButtonText || '')){
    fail('leaderboard trophy surface did not expose a Replay action for a matching local replay', result);
  }
  if(result.replayMetaCount < 1 || result.replayState.replayMetaCount < 1){
    fail('leaderboard trophy surface did not expose a clickable replay metadata cell for a matching local replay', result);
  }
  if(!result.replayState.movieOpen || !result.replayState.leaderboardClosed){
    fail('clicking the leaderboard Replay action did not switch cleanly into the replay surface', result);
  }
  if(result.replayState.selectedReplay !== 'trophy-replay-local'){
    fail('leaderboard Replay action did not open the exact matched replay', result);
  }
  if(result.replayState.playCalls < 1){
    fail('leaderboard Replay action did not attempt autoplay', result);
  }
  if(!result.replayMetaState.movieOpen || !result.replayMetaState.leaderboardClosed){
    fail('clicking the replay metadata surface did not switch cleanly into the replay surface', result);
  }
  if(result.replayMetaState.selectedReplay !== 'trophy-replay-local'){
    fail('clicking the replay metadata surface did not open the exact matched replay', result);
  }
  if(!result.promptBefore.topScoreSigninPrompt || !/Pilot Sign In/i.test(result.promptBefore.buttonText)){
    fail('unsigned top-10 score did not render the actionable Pilot Sign In prompt', result);
  }
  if(!result.promptAfter.accountOpen || !/top-10 score/i.test(result.promptAfter.accountSummary)){
    fail('Pilot Sign In prompt did not open the pilot account panel with top-score context', result);
  }
  if(!result.promptAfter.events.length){
    fail('Pilot Sign In prompt did not log the user action', result);
  }

  console.log(JSON.stringify({
    ok: true,
    replay: result.replayState,
    prompt: {
      buttonText: result.promptBefore.buttonText,
      accountSummary: result.promptAfter.accountSummary
    }
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

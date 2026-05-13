#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ skipStart: true, seed: 49061 }, async ({ page }) => {
    await page.evaluate(async () => {
      if(typeof installGamePack !== 'function') throw new Error('missing installGamePack');
      installGamePack('aurora-galactica', { persist: false });
      window.__galagaHarness__.seedLocalLeaderboard([
        {
          id: 'aurora-local-top',
          initials: 'AUR',
          score: 999999,
          stage: 13,
          at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          gameKey: 'aurora-galactica',
          gameTitle: 'Aurora Galactica'
        }
      ]);
      await window.__galagaHarness__.seedLocalReplay({
        id: 'aurora-replay-top',
        clearExisting: true,
        createdAt: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
        duration: 96,
        score: 999999,
        stage: 13,
        initials: 'AUR',
        pilotInitials: 'AUR',
        gameKey: 'aurora-galactica',
        gameTitle: 'Aurora Galactica'
      });

      installGamePack('galaxy-guardians-preview', { persist: false });
      window.__galagaHarness__.seedLocalLeaderboard([
        {
          id: 'guardians-local-top',
          initials: 'GGD',
          score: 1230,
          stage: 1,
          at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
          gameKey: 'galaxy-guardians-preview',
          gameTitle: 'Galaxy Guardians'
        }
      ]);
      await window.__galagaHarness__.seedLocalReplay({
        id: 'guardians-replay-top',
        clearExisting: false,
        createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        duration: 54,
        score: 1230,
        stage: 1,
        initials: 'GGD',
        pilotInitials: 'GGD',
        gameKey: 'galaxy-guardians-preview',
        gameTitle: 'Galaxy Guardians'
      });

      window.__galagaHarness__.setupRemoteScoreSubmitTest({
        mode: 'success',
        userId: 'pilot-guardians',
        email: 'guardians@example.com',
        initials: 'GGD',
        forceAurora: false
      });
      window.__galagaHarness__.setRemoteMineRows([
        {
          id: 'aurora-remote-top',
          initials: 'GGD',
          score: 777000,
          stage: 9,
          at: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
          verified: true,
          gameKey: 'aurora-galactica',
          gameTitle: 'Aurora Galactica'
        }
      ]);
      if(typeof refreshMovieCatalog === 'function') await refreshMovieCatalog({ silent: 1 });
      if(typeof openLeaderboardPanel === 'function') openLeaderboardPanel('local');
      document.getElementById('accountDockBtn')?.click();
    });

    await page.waitForTimeout(250);

    const before = await page.evaluate(() => ({
      currentGameKey: window.__galagaHarness__.currentPackKey(),
      leaderboardTitle: document.getElementById('leaderboardPanelSub')?.textContent?.trim() || '',
      leaderboardRows: window.__galagaHarness__.localScoreRows(),
      pilotRows: window.__galagaHarness__.pilotProfileRows(),
      replayOptions: window.__galagaHarness__.replayOptionLabels(),
      leaderboardStatus: document.getElementById('leaderboardStatus')?.textContent?.trim() || ''
    }));

    await page.evaluate(() => {
      if(typeof closeLeaderboardPanel === 'function') closeLeaderboardPanel();
      if(typeof closeAccountPanel === 'function') closeAccountPanel();
      if(typeof installGamePack === 'function') installGamePack('galaxy-guardians-preview', { persist: false });
      if(!window.__galagaHarness__?.start) throw new Error('missing harness start entrypoint');
      window.__galagaHarness__.start({ autoVideo: false, stage: 1, ships: 1, seed: 49061 });
    });
    await page.waitForTimeout(160);
    await page.evaluate(() => window.__galagaHarness__.forceGuardiansPlayerLoss('harness_guardians_loss'));
    await page.waitForTimeout(240);

    const after = await page.evaluate(() => ({
      remote: window.__galagaHarness__.remoteScoreSubmitState(),
      gameOverView: window.__galagaHarness__.gameOverView(),
      localRows: window.__galagaHarness__.localScoreRows(),
      historyRows: window.__galagaHarness__.localScoreHistory(),
      guardians: typeof window.__galagaHarness__.guardiansState === 'function' ? window.__galagaHarness__.guardiansState() : null,
      gameOverText: document.getElementById('msg')?.innerText?.replace(/\s+/g, ' ').trim() || ''
    }));

    return { before, after };
  });

  if(result.before.currentGameKey !== 'galaxy-guardians-preview'){
    fail('current score storage game did not switch to Galaxy Guardians', result);
  }
  if(!result.before.leaderboardTitle.includes('GALAXY GUARDIANS')){
    fail('leaderboard title did not become Galaxy Guardians specific', result);
  }
  if(!result.before.leaderboardRows.length || result.before.leaderboardRows.some(row => row.gameKey !== 'galaxy-guardians-preview')){
    fail('local leaderboard rows were not isolated to Galaxy Guardians', result);
  }
  if(result.before.leaderboardRows.some(row => row.score === 999999)){
    fail('Aurora local leaderboard rows leaked into the Galaxy Guardians local scoreboard', result);
  }
  if(!result.before.pilotRows.length || result.before.pilotRows.some(row => row.gameKey !== 'galaxy-guardians-preview')){
    fail('pilot profile rows were not isolated to Galaxy Guardians', result);
  }
  if(!result.before.replayOptions.some(text => text.includes('Aurora Galactica')) || !result.before.replayOptions.some(text => text.includes('Galaxy Guardians'))){
    fail('replay catalog did not expose readable game identity for mixed-game local runs', result);
  }
  if((result.after.remote.calls || []).length !== 0){
    fail('Galaxy Guardians attempted a shared remote leaderboard submit before game-owned online schema support exists', result);
  }
  if(!/game-owned online tables are pending|online scores stay local/i.test(result.after.remote.leaderboardStatus || '')){
    fail('Galaxy Guardians score submit block did not explain the local-only policy', result);
  }
  if(!result.after.gameOverView?.html || /DEV PREVIEW COMPLETE/i.test(result.after.gameOverView.html) || !/GAME OVER/i.test(result.after.gameOverView.html)){
    fail('Galaxy Guardians still used the preview placeholder instead of a real game-over/results surface', result);
  }
  if(!result.after.localRows.length || result.after.localRows.some(row => row.gameKey !== 'galaxy-guardians-preview')){
    fail('post-loss local scoreboard rows were not persisted as Galaxy Guardians rows', result);
  }
  if(!result.after.historyRows.length || result.after.historyRows.some(row => row.gameKey !== 'galaxy-guardians-preview')){
    fail('post-loss score history rows were not persisted as Galaxy Guardians rows', result);
  }
  if(!result.after.gameOverText.includes('GAME OVER')){
    fail('visible Galaxy Guardians end state did not render a real game-over surface', result);
  }

  console.log(JSON.stringify({
    ok: true,
    leaderboardTitle: result.before.leaderboardTitle,
    replayOptions: result.before.replayOptions,
    remoteStatus: result.after.remote.leaderboardStatus,
    gameOverPhase: result.after.gameOverView.phase,
    localRows: result.after.localRows
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

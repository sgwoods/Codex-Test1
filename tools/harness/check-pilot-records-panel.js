#!/usr/bin/env node
const path = require('path');
const { withHarnessPage } = require('./browser-check-util');

const ARTIFACT = '/tmp/aurora-pilot-records-panel.png';

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 2, ships: 3, challenge: false, seed: 49031 }, async ({ page }) => {
    await page.evaluate(() => window.__galagaHarness__.setupPilotRecordsPanelTest({
      replayId: 'replay-stage7-local',
      email: 'sgwoods@gmail.com',
      userId: 'pilot-swd',
      initials: 'SWD',
      score: 654321,
      stage: 7,
      duration: 113,
      createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString()
    }));
    await page.evaluate(() => {
      window.__auroraPlayCalls = 0;
      const video = document.getElementById('movieVideo');
      if(video && !video.__auroraPlayWrapped){
        const basePlay = video.play.bind(video);
        video.play = (...args) => {
          window.__auroraPlayCalls = (window.__auroraPlayCalls || 0) + 1;
          return basePlay(...args);
        };
        video.__auroraPlayWrapped = true;
      }
    });

    await page.waitForTimeout(250);
    const snapshot = await page.evaluate(() => {
      const latestFlightCard = Array.from(document.querySelectorAll('#accountFlightStats .accountStatCard')).find(card => {
        const label = card.querySelector('.accountStatLabel')?.textContent?.trim();
        return label === 'Latest Flight';
      });
      const latestFlightValue = latestFlightCard?.querySelector('.accountStatValue')?.textContent?.trim() || '';
      const replayBtn = document.querySelector('#accountRecordsTop5 .accountRecordReplayBtn');
      return {
        latestFlightValue,
        replayText: replayBtn?.textContent?.trim() || '',
        replayId: replayBtn?.getAttribute('data-replay-id') || '',
        panelOpen: !document.getElementById('accountPanel')?.hidden
      };
    });
    const replayBtn = page.locator('#accountRecordsTop5 .accountRecordReplayBtn').first();
    await replayBtn.click();
    await page.waitForTimeout(350);
    const replayOpenState = await page.evaluate(() => ({
      movieOpen: typeof window.isMoviePanelOpen === 'function' ? !!window.isMoviePanelOpen() : false,
      movieReady: document.getElementById('moviePanel')?.classList.contains('ready') || false,
      selectedReplay: document.getElementById('movieRunSelect')?.value || '',
      accountClosed: !!document.getElementById('accountPanel')?.hidden,
      playCalls: window.__auroraPlayCalls || 0
    }));

    await page.screenshot({ path: ARTIFACT });
    return Object.assign({}, snapshot, replayOpenState);
  });

  if(!result.panelOpen){
    fail('pilot records panel did not open in the deterministic check', result);
  }
  if(!result.latestFlightValue || result.latestFlightValue === '--'){
    fail('pilot records panel did not show a latest flight time', result);
  }
  if(result.replayText !== 'Replay' || !result.replayId){
    fail('pilot records panel did not show a usable Replay button', result);
  }
  if(!result.movieOpen || !result.accountClosed){
    fail('clicking Replay from pilot records did not switch into the replay surface', result);
  }
  if(result.playCalls < 1){
    fail('clicking Replay from pilot records did not attempt autoplay', result);
  }

  console.log(JSON.stringify({
    ok: true,
    latestFlightValue: result.latestFlightValue,
    replayText: result.replayText,
    replayId: result.replayId,
    movieOpen: result.movieOpen,
    movieReady: result.movieReady,
    selectedReplay: result.selectedReplay,
    playCalls: result.playCalls,
    screenshot: ARTIFACT
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

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
    await page.evaluate(async () => {
      await window.__galagaHarness__.seedLocalReplay({
        id: 'replay-stage2-fresh',
        email: 'sgwoods@gmail.com',
        pilotEmail: 'sgwoods@gmail.com',
        userId: 'pilot-swd',
        pilotUserId: 'pilot-swd',
        initials: 'SWD',
        pilotInitials: 'SWD',
        score: 3100,
        stage: 2,
        duration: 47,
        createdAt: new Date(Date.now() - 60 * 1000).toISOString()
      });
      if(typeof window.refreshMovieCatalog === 'function') await window.refreshMovieCatalog({ silent: 1 });
      if(typeof window.syncAccountUi === 'function') window.syncAccountUi();
    });
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
      const replayBtns = Array.from(document.querySelectorAll('#accountRecordsTop5 .accountRecordReplayBtn'));
      const replayIds = replayBtns.map(btn => btn.getAttribute('data-replay-id') || '');
      const replayBtn = replayBtns[0];
      const rowStamps = Array.from(document.querySelectorAll('#accountRecordsTop5 .accountRecordStamp')).map(el => el.textContent?.trim() || '');
      return {
        latestFlightValue,
        replayText: replayBtn?.textContent?.trim() || '',
        replayId: replayBtn?.getAttribute('data-replay-id') || '',
        replayCount: replayBtns.length,
        replayIds,
        rowStamps,
        panelOpen: !document.getElementById('accountPanel')?.hidden
      };
    });
    const replayBtns = page.locator('#accountRecordsTop5 .accountRecordReplayBtn');
    const replayCount = await replayBtns.count();
    const targetIndex = Math.max(0, replayCount - 1);
    const replayBtn = replayBtns.nth(targetIndex);
    const clickedReplayId = await replayBtn.getAttribute('data-replay-id') || '';
    await replayBtn.click();
    await page.waitForTimeout(350);
    const replayOpenState = await page.evaluate(() => ({
      movieOpen: typeof window.isMoviePanelOpen === 'function' ? !!window.isMoviePanelOpen() : false,
      movieReady: document.getElementById('moviePanel')?.classList.contains('ready') || false,
      selectedReplay: document.getElementById('movieRunSelect')?.value || '',
      accountClosed: !!document.getElementById('accountPanel')?.hidden,
      playCalls: window.__auroraPlayCalls || 0
    }));
    replayOpenState.clickedReplayId = clickedReplayId;

    await page.screenshot({ path: ARTIFACT });
    return Object.assign({}, snapshot, replayOpenState);
  });

  if(!result.panelOpen){
    fail('pilot records panel did not open in the deterministic check', result);
  }
  if(!result.latestFlightValue || result.latestFlightValue === '--'){
    fail('pilot records panel did not show a latest flight time', result);
  }
  if(result.latestFlightValue !== '1m ago' && result.latestFlightValue !== 'just now'){
    fail('pilot records panel did not surface the freshest local flight', result);
  }
  if(result.replayText !== 'Replay' || !result.replayId){
    fail('pilot records panel did not show a usable Replay button', result);
  }
  if(result.replayCount < 2){
    fail('pilot records panel did not expose replay actions for the merged local and remote pilot flights', result);
  }
  if(result.replayIds.some(id => !id)){
    fail('pilot records panel rendered a Replay button without a replay id', result);
  }
  if(!result.rowStamps.some(stamp => stamp === '1m ago' || stamp === 'just now')){
    fail('pilot records panel did not show the freshest local replay row', result);
  }
  if(!result.movieOpen || !result.accountClosed){
    fail('clicking Replay from pilot records did not switch into the replay surface', result);
  }
  if(result.selectedReplay !== result.clickedReplayId){
    fail('clicking Replay from pilot records did not open the exact replay row that was clicked', result);
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

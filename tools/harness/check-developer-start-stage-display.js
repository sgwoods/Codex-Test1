#!/usr/bin/env node
const { withHarnessPage, sleep } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function readStageSnapshot(page){
  return page.evaluate(() => {
    const state = window.__galagaHarness__.state();
    const banner = window.__galagaHarness__.bannerState();
    let saved = {};
    try{
      saved = JSON.parse(localStorage.getItem('platinumTestCfg') || localStorage.getItem('auroraGalacticaTestCfg') || '{}');
    }catch{}
    const shownMatch = String(banner.bannerTxt || '').match(/^STAGE\s+(\d+)/);
    return {
      state,
      snap: window.__galagaHarness__.snapshot(),
      banner,
      requestedStage: +document.getElementById('testStage')?.value || 0,
      requestedStartKind: document.getElementById('testStartKind')?.value || 'level',
      requestedChallengeStage: +document.getElementById('testChallengeStage')?.value || 0,
      savedStage: +saved.stage || 0,
      savedStartKind: saved.startKind || '',
      savedChallengeStage: +saved.challengeStage || 0,
      displayedStage: shownMatch ? +shownMatch[1] : null
    };
  });
}

async function readDeveloperStart(stage){
  return withHarnessPage({ skipStart: true, seed: 7707 }, async ({ page }) => {
    await page.evaluate(requestedStage => {
      if(typeof installGamePack === 'function')installGamePack('aurora-galactica');
      const stageEl = document.getElementById('testStage');
      const startKindEl = document.getElementById('testStartKind');
      const challengeStageEl = document.getElementById('testChallengeStage');
      const shipsEl = document.getElementById('testShips');
      const challengeEl = document.getElementById('testChallenge');
      if(startKindEl)startKindEl.value = 'level';
      if(stageEl)stageEl.value = String(requestedStage);
      if(challengeStageEl)challengeStageEl.value = '1';
      if(shipsEl)shipsEl.value = '3';
      if(challengeEl)challengeEl.checked = false;
      window.startActiveGamePack();
    }, stage);
    await sleep(250);
    return readStageSnapshot(page);
  });
}

async function readDeveloperChallengeStart(challengeStage){
  return withHarnessPage({ skipStart: true, seed: 7709 }, async ({ page }) => {
    await page.evaluate(requestedChallenge => {
      if(typeof installGamePack === 'function')installGamePack('aurora-galactica');
      const startKindEl = document.getElementById('testStartKind');
      const challengeStageEl = document.getElementById('testChallengeStage');
      const stageEl = document.getElementById('testStage');
      const shipsEl = document.getElementById('testShips');
      if(startKindEl)startKindEl.value = 'challenge';
      if(challengeStageEl)challengeStageEl.value = String(requestedChallenge);
      if(stageEl)stageEl.value = '1';
      if(shipsEl)shipsEl.value = '3';
      window.startActiveGamePack();
    }, challengeStage);
    await sleep(250);
    return readStageSnapshot(page);
  });
}

async function readHarnessInternalStart(stage){
  return withHarnessPage({ stage, ships: 3, challenge: false, seed: 7708 }, async ({ page }) => {
    await sleep(100);
    return readStageSnapshot(page);
  });
}

async function main(){
  const developerStage7 = await readDeveloperStart(7);
  if(!developerStage7.state.started) fail('developer start did not enter gameplay', developerStage7);
  if(developerStage7.requestedStage !== 7 || developerStage7.savedStage !== 7){
    fail('developer start should preserve the requested displayed stage in settings storage', developerStage7);
  }
  if(developerStage7.state.challenge){
    fail('developer Start Stage 7 should resolve to regular displayed Stage 7, not the hidden challenge index', developerStage7);
  }
  if(developerStage7.state.stage !== 9){
    fail('developer Start Stage 7 should map to Aurora internal stage 9 after skipping challenge slots', developerStage7);
  }
  if(developerStage7.displayedStage !== 7 || developerStage7.banner?.bannerTxt !== 'STAGE 07'){
    fail('developer Start Stage 7 should present the visible Stage 07 banner', developerStage7);
  }

  const harnessStage7 = await readHarnessInternalStart(7);
  if(harnessStage7.state.stage !== 7 || !harnessStage7.state.challenge){
    fail('harness stage 7 should keep the historical internal-stage semantics used by conformance scenarios', harnessStage7);
  }
  if(harnessStage7.banner?.bannerTxt !== 'CHALLENGING STAGE 2'){
    fail('harness internal stage 7 should still present the second challenge window', harnessStage7);
  }

  const developerChallenge2 = await readDeveloperChallengeStart(2);
  if(!developerChallenge2.state.started || !developerChallenge2.state.challenge){
    fail('developer challenge-stage start did not enter challenge gameplay', developerChallenge2);
  }
  if(developerChallenge2.state.stage !== 7 || developerChallenge2.requestedStartKind !== 'challenge' || developerChallenge2.requestedChallengeStage !== 2){
    fail('developer Challenging Stage 2 should map to Aurora internal challenge marker 7', developerChallenge2);
  }
  if(developerChallenge2.banner?.bannerTxt !== 'CHALLENGING STAGE 2' || developerChallenge2.banner?.bannerSub !== 'LEVELS 7-8'){
    fail('developer challenge-stage start should present challenge-stage numbering and level bracket separately', developerChallenge2);
  }

  console.log(JSON.stringify({
    ok: true,
    developerStart: {
      requestedStage: developerStage7.requestedStage,
      internalStage: developerStage7.state.stage,
      displayedStage: developerStage7.displayedStage,
      challenge: developerStage7.state.challenge,
      bannerTxt: developerStage7.banner.bannerTxt
    },
    harnessInternalStart: {
      requestedStage: harnessStage7.requestedStage,
      internalStage: harnessStage7.state.stage,
      displayedStage: harnessStage7.displayedStage,
      challenge: harnessStage7.state.challenge,
      bannerTxt: harnessStage7.banner.bannerTxt
    },
    developerChallengeStart: {
      requestedChallengeStage: developerChallenge2.requestedChallengeStage,
      internalStage: developerChallenge2.state.stage,
      challenge: developerChallenge2.state.challenge,
      bannerTxt: developerChallenge2.banner.bannerTxt,
      bannerSub: developerChallenge2.banner.bannerSub
    }
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

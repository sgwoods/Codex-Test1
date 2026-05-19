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
      requestedExpertPlays: document.getElementById('testExpertPlays')?.value || 'human',
      requestedChallengeStage: +document.getElementById('testChallengeStage')?.value || 0,
      savedStage: +saved.stage || 0,
      savedStartKind: saved.startKind || '',
      savedExpertPlays: saved.expertPlays || 'human',
      savedChallengeStage: +saved.challengeStage || 0,
      displayedStage: shownMatch ? +shownMatch[1] : null
    };
  });
}

async function readDeveloperStart(stage, expertPlays = 'human'){
  return withHarnessPage({ skipStart: true, seed: 7707 }, async ({ page }) => {
    await page.evaluate(({ requestedStage, expertPlays }) => {
      if(typeof installGamePack === 'function')installGamePack('aurora-galactica');
      const stageEl = document.getElementById('testStage');
      const startKindEl = document.getElementById('testStartKind');
      const expertPlaysEl = document.getElementById('testExpertPlays');
      const challengeStageEl = document.getElementById('testChallengeStage');
      const shipsEl = document.getElementById('testShips');
      const challengeEl = document.getElementById('testChallenge');
      if(startKindEl)startKindEl.value = 'level';
      if(expertPlaysEl)expertPlaysEl.value = expertPlays;
      if(stageEl)stageEl.value = String(requestedStage);
      if(challengeStageEl)challengeStageEl.value = '1';
      if(shipsEl)shipsEl.value = '3';
      if(challengeEl)challengeEl.checked = false;
      window.startActiveGamePack();
    }, { requestedStage: stage, expertPlays });
    await sleep(250);
    return readStageSnapshot(page);
  });
}

async function readDeveloperChallengeStart(challengeStage, expertPlays = 'human'){
  return withHarnessPage({ skipStart: true, seed: 7709 }, async ({ page }) => {
    await page.evaluate(({ requestedChallenge, expertPlays }) => {
      if(typeof installGamePack === 'function')installGamePack('aurora-galactica');
      const startKindEl = document.getElementById('testStartKind');
      const expertPlaysEl = document.getElementById('testExpertPlays');
      const challengeStageEl = document.getElementById('testChallengeStage');
      const stageEl = document.getElementById('testStage');
      const shipsEl = document.getElementById('testShips');
      if(startKindEl)startKindEl.value = 'challenge';
      if(expertPlaysEl)expertPlaysEl.value = expertPlays;
      if(challengeStageEl)challengeStageEl.value = String(requestedChallenge);
      if(stageEl)stageEl.value = '1';
      if(shipsEl)shipsEl.value = '3';
      window.startActiveGamePack();
    }, { requestedChallenge: challengeStage, expertPlays });
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
  if(developerStage7.state.watchMode || developerStage7.requestedExpertPlays !== 'human' || developerStage7.savedExpertPlays !== 'human'){
    fail('developer Start Stage should default to human-controlled gameplay', developerStage7);
  }

  const developerExpertStage7 = await readDeveloperStart(7, 'expert');
  if(!developerExpertStage7.state.started || !developerExpertStage7.state.watchMode){
    fail('developer Expert Plays start should enter watch mode at the requested start level', developerExpertStage7);
  }
  if(developerExpertStage7.state.harnessPersona !== 'expert' || developerExpertStage7.state.watchPersona !== 'expert'){
    fail('developer Expert Plays start should assign the expert persona to the run', developerExpertStage7);
  }
  if(developerExpertStage7.state.stage !== 9 || developerExpertStage7.displayedStage !== 7){
    fail('developer Expert Plays should preserve the requested displayed level mapping', developerExpertStage7);
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

  const developerProChallenge2 = await readDeveloperChallengeStart(2, 'professional');
  if(!developerProChallenge2.state.started || !developerProChallenge2.state.watchMode || !developerProChallenge2.state.challenge){
    fail('developer Professional Plays challenge start should enter watch-mode challenge gameplay', developerProChallenge2);
  }
  if(developerProChallenge2.state.harnessPersona !== 'professional' || developerProChallenge2.state.watchPersona !== 'professional'){
    fail('developer Professional Plays challenge start should assign the professional persona to the run', developerProChallenge2);
  }
  if(developerProChallenge2.state.stage !== 7 || developerProChallenge2.banner?.bannerTxt !== 'CHALLENGING STAGE 2'){
    fail('developer Professional Plays challenge start should preserve challenge-stage mapping', developerProChallenge2);
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
    },
    expertPlays: {
      requestedStage: developerExpertStage7.requestedStage,
      internalStage: developerExpertStage7.state.stage,
      watchMode: developerExpertStage7.state.watchMode,
      persona: developerExpertStage7.state.harnessPersona,
      bannerTxt: developerExpertStage7.banner.bannerTxt
    },
    professionalChallengePlays: {
      requestedChallengeStage: developerProChallenge2.requestedChallengeStage,
      internalStage: developerProChallenge2.state.stage,
      watchMode: developerProChallenge2.state.watchMode,
      persona: developerProChallenge2.state.harnessPersona,
      bannerTxt: developerProChallenge2.banner.bannerTxt
    }
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

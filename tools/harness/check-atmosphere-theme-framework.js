#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 1, ships: 3, challenge: false, seed: 24134, skipStart: true }, async ({ page }) => {
    const frontDoor = await page.evaluate(() => {
      return window.__galagaHarness__.showFrontDoor();
    });
    const stageOne = await page.evaluate(() => {
      window.__galagaHarness__.setTest({ stage: 1, ships: 3, challenge: false });
      window.__galagaHarness__.restartCurrentConfig();
      return window.__galagaHarness__.state();
    });
    const stageEight = await page.evaluate(() => {
      window.__galagaHarness__.setTest({ stage: 8, ships: 3, challenge: false });
      window.__galagaHarness__.restartCurrentConfig();
      return window.__galagaHarness__.state();
    });
    const challengeEleven = await page.evaluate(() => {
      window.__galagaHarness__.setTest({ stage: 11, ships: 3, challenge: true });
      window.__galagaHarness__.restartCurrentConfig();
      return window.__galagaHarness__.state();
    });
    return { frontDoor, stageOne, stageEight, challengeEleven };
  });

  if(result.frontDoor.started) fail('front-door harness state unexpectedly started gameplay', result);
  if(result.frontDoor.atmosphere?.phase !== 'frontDoor') fail('front-door atmosphere did not resolve the frontDoor phase', result);
  if(result.frontDoor.atmosphere?.backgroundMode !== 'aurora-borealis') fail('front-door atmosphere did not pick the Aurora preview background', result);
  if(result.frontDoor.atmosphere?.audioTheme !== 'aurora-crown') fail('front-door atmosphere did not pick the Aurora front-door audio theme', result);

  if(result.stageOne.stagePresentation?.atmosphereTheme !== 'classic-arcade') fail('stage 1 did not resolve the classic arcade atmosphere theme', result);
  if(result.stageOne.atmosphere?.backgroundMode !== 'classic-stars') fail('stage 1 did not keep the classic moving-stars background', result);
  if(result.stageOne.atmosphere?.audioTheme !== 'classic-arcade') fail('stage 1 did not use the classic arcade audio theme', result);
  if(result.stageOne.atmosphere?.starfield?.count < 100) fail('stage 1 classic starfield is no longer using the brighter arcade density profile', result);
  if(result.stageOne.atmosphere?.starfield?.alphaMin < 0.5) fail('stage 1 classic starfield minimum alpha drifted below the intended arcade intensity', result);
  if(result.stageOne.audioCue?.cue !== 'gameStart') fail('stage 1 start did not record the expected game-start cue', result);

  if(result.stageEight.stagePresentation?.atmosphereTheme !== 'aurora-borealis') fail('stage 8 did not resolve the Aurora borealis atmosphere theme', result);
  if(result.stageEight.atmosphere?.backgroundMode !== 'aurora-borealis') fail('stage 8 did not use the Aurora borealis background', result);
  if(result.stageEight.atmosphere?.audioTheme !== 'aurora-surge') fail('stage 8 did not use the Aurora surge audio theme', result);
  if(result.stageEight.audioCue?.cue !== 'gameStart') fail('stage 8 start did not record the expected game-start cue', result);

  if(!result.challengeEleven.challenge) fail('challenge-stage harness state did not start in challenge mode', result);
  if(result.challengeEleven.atmosphere?.phase !== 'challenge') fail('challenge stage did not resolve the challenge atmosphere phase', result);
  if(result.challengeEleven.atmosphere?.backgroundMode !== 'aurora-borealis') fail('challenge stage did not keep the configured Aurora background', result);
  if(result.challengeEleven.atmosphere?.audioTheme !== 'aurora-surge') fail('challenge stage did not use the expected challenge audio theme', result);
  if(result.challengeEleven.audioCue?.phase !== 'challenge') fail('challenge-stage start cue did not resolve through the challenge audio phase', result);

  console.log(JSON.stringify({
    ok: true,
    frontDoor: result.frontDoor.atmosphere,
    stageOne: {
      presentation: result.stageOne.stagePresentation,
      atmosphere: result.stageOne.atmosphere,
      audioCue: result.stageOne.audioCue
    },
    stageEight: {
      presentation: result.stageEight.stagePresentation,
      atmosphere: result.stageEight.atmosphere,
      audioCue: result.stageEight.audioCue
    },
    challengeEleven: {
      presentation: result.challengeEleven.stagePresentation,
      atmosphere: result.challengeEleven.atmosphere,
      audioCue: result.challengeEleven.audioCue
    }
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

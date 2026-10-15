#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const { DIST_DEV } = require('../build/paths');
const { withHarnessPage, waitForHarness } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function createNonDevelopmentFixture(){
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guardians-stage-five-review-'));
  fs.cpSync(DIST_DEV, root, { recursive: true });
  const indexPath = path.join(root, 'index.html');
  const source = fs.readFileSync(indexPath, 'utf8');
  const fixture = source
    .replace("INITIAL_BUILD_CHANNEL='development'", "INITIAL_BUILD_CHANNEL='production beta'")
    .replace("releaseChannel:'development'", "releaseChannel:'production beta'");
  if(fixture === source) throw new Error('Unable to create non-development launcher fixture');
  fs.writeFileSync(indexPath, fixture);
  return root;
}

async function launchReview(page, { seed, mode, armedPersona = '' }){
  await page.evaluate(({ seed: reviewSeed, mode: reviewMode, armedPersona: armed }) => {
    if(armed){
      window.__platinumWatchModePersona = armed;
      window.__auroraWatchModePersona = armed;
      window.__platinumWatchModeScope = 'game';
      window.__auroraWatchModeScope = 'game';
    }
    const seedControl = document.getElementById('guardiansStageFiveSeed');
    const modeControl = document.getElementById('guardiansStageFiveMode');
    seedControl.value = String(reviewSeed);
    modeControl.value = reviewMode;
    document.getElementById('guardiansStageFiveLaunch').click();
  }, { seed, mode, armedPersona });

  return waitForHarness(page, () => {
    const shell = window.__galagaHarness__.state();
    const runtime = typeof summarizeGalaxyGuardiansDevPreview === 'function'
      ? summarizeGalaxyGuardiansDevPreview()
      : null;
    if(!shell.started || !runtime?.reviewConfig) return null;
    return {
      shell,
      runtime,
      status: document.getElementById('guardiansStageFiveReviewStatus')?.textContent || ''
    };
  }, 1600, 40);
}

async function main(){
  const result = await withHarnessPage({ skipStart: true, seed: 12553 }, async ({ page }) => {
    const controls = await page.evaluate(() => {
      installGamePack('galaxy-guardians-preview', { persist: false });
      document.getElementById('settingsBtn').click();
      const panel = document.getElementById('guardiansStageFiveReview');
      return {
        hidden: panel.hidden,
        disabled: document.getElementById('guardiansStageFiveLaunch').disabled,
        seeds: Array.from(document.getElementById('guardiansStageFiveSeed').options).map(option => option.value),
        modes: Array.from(document.getElementById('guardiansStageFiveMode').options).map(option => option.value)
      };
    });

    const professional = await launchReview(page, {
      seed: 12553,
      mode: 'professional',
      armedPersona: 'advanced'
    });
    const manualAfterProfessional = await launchReview(page, {
      seed: 13550,
      mode: 'manual',
      armedPersona: 'expert'
    });
    const manualThirdSeed = await launchReview(page, {
      seed: 14547,
      mode: 'manual',
      armedPersona: 'novice'
    });

    await page.evaluate(() => {
      window.__galagaHarness__.stop('stage_five_review_normal_launch');
      window.__galagaHarness__.start({
        gameKey: 'galaxy-guardians-preview',
        forceAurora: false,
        stage: 1,
        ships: 3,
        seed: 24680,
        maxPlayableStage: 1,
        expertPlays: 'human',
        watchMode: false,
        autoVideo: false
      });
    });
    const normal = await waitForHarness(page, () => {
      const shell = window.__galagaHarness__.state();
      const runtime = typeof summarizeGalaxyGuardiansDevPreview === 'function'
        ? summarizeGalaxyGuardiansDevPreview()
        : null;
      if(!shell.started || !runtime || runtime.stage !== 1 || runtime.reviewConfig) return null;
      return { shell, runtime };
    }, 1600, 40);

    return { controls, professional, manualAfterProfessional, manualThirdSeed, normal };
  });

  const nonDevelopmentRoot = createNonDevelopmentFixture();
  let nonDevelopment;
  try{
    nonDevelopment = await withHarnessPage({
      root: nonDevelopmentRoot,
      skipStart: true,
      seed: 12553
    }, async ({ page }) => page.evaluate(() => {
      installGamePack('galaxy-guardians-preview', { persist: false });
      document.getElementById('settingsBtn').click();
      const panel = document.getElementById('guardiansStageFiveReview');
      const launch = document.getElementById('guardiansStageFiveLaunch');
      launch.click();
      return {
        hidden: panel.hidden,
        disabled: launch.disabled,
        started: window.__galagaHarness__.state().started,
        runtime: typeof summarizeGalaxyGuardiansDevPreview === 'function'
          ? summarizeGalaxyGuardiansDevPreview()
          : null,
        channel: document.getElementById('buildStampChannel')?.textContent || ''
      };
    }));
  }finally{
    fs.rmSync(nonDevelopmentRoot, { recursive: true, force: true });
  }

  if(result.controls.hidden || result.controls.disabled){
    fail('Guardians Stage 5 review controls should be available in a development build', result);
  }
  if(result.controls.seeds.join(',') !== '12553,13550,14547'){
    fail('Guardians Stage 5 review should expose the fixed comparison seed set', result);
  }
  if(result.controls.modes.join(',') !== 'manual,professional'){
    fail('Guardians Stage 5 review should expose manual and professional-watch modes', result);
  }

  const professional = result.professional;
  if(professional.runtime.stage !== 5 || professional.runtime.lives !== 5 || professional.runtime.maxPlayableStage !== 9){
    fail('Professional review should start at Stage 5 with five ships and stages 5-9 available', result);
  }
  if(!professional.shell.watchMode || professional.shell.watchPersona !== 'professional'){
    fail('Professional review should launch the professional Watch pilot', result);
  }
  if(professional.runtime.reviewConfig.mode !== 'professional-watch' || professional.runtime.reviewConfig.seed !== 12553){
    fail('Professional review should preserve the selected seed and review metadata', result);
  }
  if(!/Stage 5/.test(professional.status) || !/Professional Watch/.test(professional.status)){
    fail('Professional review should report its active comparison state', result);
  }

  for(const [label, manual, seed] of [
    ['manual-after-professional', result.manualAfterProfessional, 13550],
    ['manual-third-seed', result.manualThirdSeed, 14547]
  ]){
    if(manual.runtime.stage !== 5 || manual.runtime.lives !== 5 || manual.runtime.maxPlayableStage !== 9){
      fail(`${label} should start at Stage 5 with five ships and stages 5-9 available`, result);
    }
    if(manual.shell.watchMode || manual.shell.watchPersona || manual.runtime.reviewConfig.mode !== 'manual-play' || manual.runtime.reviewConfig.seed !== seed){
      fail(`${label} should override armed Watch state with human control and preserve its seed`, result);
    }
    if(!/Stage 5/.test(manual.status) || !/Manual Play/.test(manual.status)){
      fail(`${label} should report its active comparison state`, result);
    }
  }

  if(result.normal.runtime.reviewConfig || result.normal.runtime.stage !== 1 || result.normal.shell.watchMode || result.normal.shell.watchPersona){
    fail('A normal launch after review should return to human control without stale review metadata', result);
  }
  if(!nonDevelopment.hidden || !nonDevelopment.disabled || nonDevelopment.started || nonDevelopment.runtime){
    fail('Guardians Stage 5 review controls should be unavailable outside the development lane', nonDevelopment);
  }
  if(!/production beta/i.test(nonDevelopment.channel)){
    fail('Non-development launcher coverage should run against the beta lane', nonDevelopment);
  }

  console.log(JSON.stringify({
    ok: true,
    seeds: result.controls.seeds,
    professional: {
      stage: professional.runtime.stage,
      ships: professional.runtime.lives,
      persona: professional.shell.watchPersona,
      review: professional.runtime.reviewConfig
    },
    manualAfterProfessional: result.manualAfterProfessional.runtime.reviewConfig,
    manualThirdSeed: result.manualThirdSeed.runtime.reviewConfig,
    normalLaunchReviewConfig: result.normal.runtime.reviewConfig,
    nonDevelopment
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

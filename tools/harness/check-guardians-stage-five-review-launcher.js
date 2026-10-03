#!/usr/bin/env node
const { withHarnessPage, waitForHarness } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function launchReview(page, { seed, mode }){
  await page.evaluate(({ seed: reviewSeed, mode: reviewMode }) => {
    const seedControl = document.getElementById('guardiansStageFiveSeed');
    const modeControl = document.getElementById('guardiansStageFiveMode');
    seedControl.value = String(reviewSeed);
    modeControl.value = reviewMode;
    document.getElementById('guardiansStageFiveLaunch').click();
  }, { seed, mode });

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

    const manual = await launchReview(page, { seed: 12553, mode: 'manual' });
    const professional = await launchReview(page, { seed: 14547, mode: 'professional' });
    return { controls, manual, professional };
  });

  if(result.controls.hidden || result.controls.disabled){
    fail('Guardians Stage 5 review controls should be available in a development build', result);
  }
  if(result.controls.seeds.join(',') !== '12553,13550,14547'){
    fail('Guardians Stage 5 review should expose the fixed comparison seed set', result);
  }
  if(result.controls.modes.join(',') !== 'manual,professional'){
    fail('Guardians Stage 5 review should expose manual and professional-watch modes', result);
  }

  const manual = result.manual;
  if(manual.runtime.stage !== 5 || manual.runtime.lives !== 5 || manual.runtime.maxPlayableStage !== 9){
    fail('Manual review should start at Stage 5 with five ships and stages 5-9 available', result);
  }
  if(manual.shell.watchMode || manual.runtime.reviewConfig.mode !== 'manual-play' || manual.runtime.reviewConfig.seed !== 12553){
    fail('Manual review should preserve the selected seed and human pilot mode', result);
  }
  if(!/Stage 5/.test(manual.status) || !/Manual Play/.test(manual.status)){
    fail('Manual review should report its active comparison state', result);
  }

  const professional = result.professional;
  if(professional.runtime.stage !== 5 || professional.runtime.lives !== 5 || professional.runtime.maxPlayableStage !== 9){
    fail('Professional review should start at Stage 5 with five ships and stages 5-9 available', result);
  }
  if(!professional.shell.watchMode || professional.shell.watchPersona !== 'professional'){
    fail('Professional review should launch the professional Watch pilot', result);
  }
  if(professional.runtime.reviewConfig.mode !== 'professional-watch' || professional.runtime.reviewConfig.seed !== 14547){
    fail('Professional review should preserve the selected seed and review metadata', result);
  }
  if(!/Stage 5/.test(professional.status) || !/Professional Watch/.test(professional.status)){
    fail('Professional review should report its active comparison state', result);
  }

  console.log(JSON.stringify({
    ok: true,
    seeds: result.controls.seeds,
    manual: {
      stage: manual.runtime.stage,
      ships: manual.runtime.lives,
      review: manual.runtime.reviewConfig
    },
    professional: {
      stage: professional.runtime.stage,
      ships: professional.runtime.lives,
      persona: professional.shell.watchPersona,
      review: professional.runtime.reviewConfig
    }
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

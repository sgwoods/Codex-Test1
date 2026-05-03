#!/usr/bin/env node
const { withHarnessPage, waitForHarness } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 1, ships: 3, challenge: false, seed: 1979, skipStart: true }, async ({ page }) => {
    const waitShowcase = await waitForHarness(page, () => {
      window.__platinumWaitModeShowcaseForce = 'galaxy-guardians-preview';
      if(typeof draw === 'function') draw();
      const msg = document.getElementById('msg');
      const text = (msg?.innerText || '').replace(/\s+/g, ' ').trim();
      const renderer = window.__galaxyGuardiansPreviewRenderDebug || {};
      if(!text.includes('WE ARE THE GALAXY GUARDIANS') || renderer.renderMode !== 'galaxy-guardians-dev-preview') return null;
      return {
        text,
        activePack: typeof currentGamePackKey === 'function' ? currentGamePackKey() : '',
        showcaseKey: typeof currentWaitModeShowcasePackKey === 'function' ? currentWaitModeShowcasePackKey() : '',
        missionLineCount: msg?.querySelectorAll('.startMissionLine').length || 0,
        scoreCellCount: msg?.querySelectorAll('.startScoreAdvance span').length || 0,
        hasScoreTable: !!msg?.querySelector('.startScoreAdvance')
      };
    }, 2400, 40);

    await page.evaluate(() => {
      installGamePack('galaxy-guardians-preview');
      openGamePreview();
      if(typeof draw === 'function') draw();
    });

    const previewModal = await waitForHarness(page, () => {
      const modal = document.getElementById('gamePreviewModal');
      const panel = document.getElementById('gamePreviewPanel');
      const mission = document.getElementById('gamePreviewMission');
      const score = document.getElementById('gamePreviewScoreTable');
      if(!modal?.classList.contains('open') || !mission || mission.hidden || !score || score.hidden) return null;
      const modalRect = modal.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const text = `${mission.innerText} ${score.innerText}`.replace(/\s+/g, ' ').trim();
      return {
        text,
        panel: {
          left: Math.round(panelRect.left),
          top: Math.round(panelRect.top),
          right: Math.round(panelRect.right),
          bottom: Math.round(panelRect.bottom),
          width: Math.round(panelRect.width),
          height: Math.round(panelRect.height)
        },
        modal: {
          left: Math.round(modalRect.left),
          top: Math.round(modalRect.top),
          right: Math.round(modalRect.right),
          bottom: Math.round(modalRect.bottom),
          width: Math.round(modalRect.width),
          height: Math.round(modalRect.height)
        },
        missionLineCount: mission.querySelectorAll('.gamePreviewMissionLine').length,
        scoreLabelCount: score.querySelectorAll('.gamePreviewScoreLabel').length,
        scoreHeadCount: score.querySelectorAll('.gamePreviewScoreHead').length
      };
    }, 2400, 40);

    return { waitShowcase, previewModal };
  });

  for(const phrase of [
    'WE ARE THE GALAXY GUARDIANS',
    'MISSION: BREAK THE SIGNAL RACK',
    'WATCH FOR FLAGSHIP ESCORT DIVES',
    'SINGLE SHOT ONLY - MAKE IT COUNT',
    'Signal Scout',
    'Signal Escort',
    'Signal Flagship',
    '800'
  ]){
    if(!result.waitShowcase.text.includes(phrase)){
      fail(`Guardians wait-mode showcase is missing attract/score phrase: ${phrase}`, result);
    }
    if(!result.previewModal.text.includes(phrase)){
      fail(`Guardians preview modal is missing attract/score phrase: ${phrase}`, result);
    }
  }
  if(result.waitShowcase.activePack !== 'aurora-galactica' || result.waitShowcase.showcaseKey !== 'galaxy-guardians-preview'){
    fail('Guardians attract/score showcase changed the active pack instead of staying in Aurora wait mode', result);
  }
  if(result.waitShowcase.missionLineCount !== 3 || !result.waitShowcase.hasScoreTable || result.waitShowcase.scoreCellCount < 20){
    fail('Guardians wait-mode showcase did not render the compact mission and score table', result);
  }
  if(result.previewModal.missionLineCount !== 3 || result.previewModal.scoreLabelCount !== 3 || result.previewModal.scoreHeadCount < 5){
    fail('Guardians preview modal did not render the mission and score table structure', result);
  }
  if(result.previewModal.panel.left < result.previewModal.modal.left
    || result.previewModal.panel.top < result.previewModal.modal.top
    || result.previewModal.panel.right > result.previewModal.modal.right
    || result.previewModal.panel.bottom > result.previewModal.modal.bottom){
    fail('Guardians preview modal panel escaped the framed gameplay modal bounds', result);
  }

  console.log(JSON.stringify({ ok: true, result }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

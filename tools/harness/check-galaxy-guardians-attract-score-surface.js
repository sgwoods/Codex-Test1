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
      const mission = msg?.querySelector('.startMissionWrap.guardiansMission');
      const scoreTable = msg?.querySelector('.startScoreAdvance.guardiansScoreAdvance');
      const text = (msg?.innerText || '').replace(/\s+/g, ' ').trim();
      const renderer = window.__galaxyGuardiansPreviewRenderDebug || {};
      if(!text.includes('WE ARE THE GALAXY GUARDIANS') || renderer.renderMode !== 'galaxy-guardians-dev-preview') return null;
      const msgRect = msg?.getBoundingClientRect();
      const missionRect = mission?.getBoundingClientRect();
      const scoreRect = scoreTable?.getBoundingClientRect();
      return {
        text,
        activePack: typeof currentGamePackKey === 'function' ? currentGamePackKey() : '',
        showcaseKey: typeof currentWaitModeShowcasePackKey === 'function' ? currentWaitModeShowcasePackKey() : '',
        missionLineCount: msg?.querySelectorAll('.startMissionLine').length || 0,
        scoreCellCount: msg?.querySelectorAll('.startScoreAdvance span').length || 0,
        hasScoreTable: !!scoreTable,
        hasGuardiansMissionClass: !!mission,
        hasGuardiansScoreClass: !!scoreTable,
        msg: msgRect ? {
          left: Math.round(msgRect.left),
          top: Math.round(msgRect.top),
          width: Math.round(msgRect.width),
          height: Math.round(msgRect.height)
        } : null,
        mission: missionRect ? {
          left: Math.round(missionRect.left),
          top: Math.round(missionRect.top),
          width: Math.round(missionRect.width),
          height: Math.round(missionRect.height)
        } : null,
        score: scoreRect ? {
          left: Math.round(scoreRect.left),
          top: Math.round(scoreRect.top),
          width: Math.round(scoreRect.width),
          height: Math.round(scoreRect.height)
        } : null
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
      const missionRect = mission.getBoundingClientRect();
      const scoreRect = score.getBoundingClientRect();
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
        scoreHeadCount: score.querySelectorAll('.gamePreviewScoreHead').length,
        missionClass: mission.className,
        scoreClass: score.className,
        mission: {
          left: Math.round(missionRect.left),
          top: Math.round(missionRect.top),
          width: Math.round(missionRect.width),
          height: Math.round(missionRect.height)
        },
        score: {
          left: Math.round(scoreRect.left),
          top: Math.round(scoreRect.top),
          width: Math.round(scoreRect.width),
          height: Math.round(scoreRect.height)
        }
      };
    }, 2400, 40);

    return { waitShowcase, previewModal };
  });

	  for(const phrase of [
	    'WE ARE THE GALAXY GUARDIANS',
	    'MISSION: DESTROY ALIENS',
	    'WATCH FOR FLAGSHIP CHARGER DIVES',
	    'SINGLE SHOT ONLY - MAKE IT COUNT',
	    'SCORE ADVANCE TABLE',
	    'CONVOY',
	    'CHARGER',
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
  if(result.waitShowcase.missionLineCount !== 3
    || !result.waitShowcase.hasScoreTable
    || !result.waitShowcase.hasGuardiansMissionClass
    || !result.waitShowcase.hasGuardiansScoreClass
    || result.waitShowcase.scoreCellCount < 20){
    fail('Guardians wait-mode showcase did not render the compact mission and score table', result);
  }
  if(!result.waitShowcase.msg || !result.waitShowcase.mission || !result.waitShowcase.score){
    fail('Guardians wait-mode showcase did not expose layout geometry for the mission and score table', result);
  }
  const waitMissionCenter = result.waitShowcase.mission.left + result.waitShowcase.mission.width / 2;
  const waitScoreCenter = result.waitShowcase.score.left + result.waitShowcase.score.width / 2;
  if(Math.abs(waitMissionCenter - waitScoreCenter) > 10){
    fail('Guardians wait-mode mission and score table drifted off a common horizontal centerline', result);
  }
  const waitScoreWidthRatio = result.waitShowcase.score.width / Math.max(1, result.waitShowcase.msg.width);
  if(waitScoreWidthRatio < 0.16 || waitScoreWidthRatio > 0.28){
    fail('Guardians wait-mode score table no longer keeps the intended compact width within the wait surface', Object.assign({
      waitScoreWidthRatio
    }, result));
  }
  if(result.waitShowcase.score.top <= result.waitShowcase.mission.top + result.waitShowcase.mission.height){
    fail('Guardians wait-mode score table no longer sits cleanly below the mission block', result);
  }
  if(result.previewModal.missionLineCount !== 3 || result.previewModal.scoreLabelCount !== 3 || result.previewModal.scoreHeadCount < 5){
    fail('Guardians preview modal did not render the mission and score table structure', result);
  }
  if(!String(result.previewModal.missionClass || '').includes('guardiansMission')
    || !String(result.previewModal.scoreClass || '').includes('guardiansScoreAdvance')){
    fail('Guardians preview modal did not keep the expected layout classes for mission and score table', result);
  }
  if(result.previewModal.panel.left < result.previewModal.modal.left
    || result.previewModal.panel.top < result.previewModal.modal.top
    || result.previewModal.panel.right > result.previewModal.modal.right
    || result.previewModal.panel.bottom > result.previewModal.modal.bottom){
    fail('Guardians preview modal panel escaped the framed gameplay modal bounds', result);
  }
  const previewMissionCenter = result.previewModal.mission.left + result.previewModal.mission.width / 2;
  const previewScoreCenter = result.previewModal.score.left + result.previewModal.score.width / 2;
  if(Math.abs(previewMissionCenter - previewScoreCenter) > 12){
    fail('Guardians preview modal mission and score table drifted off a common horizontal centerline', result);
  }
  if(result.previewModal.score.width < result.previewModal.mission.width * 0.82
    || result.previewModal.score.width > result.previewModal.mission.width * 1.42){
    fail('Guardians preview modal score table width drifted too far from the mission block', result);
  }
  if(result.previewModal.score.top <= result.previewModal.mission.top + result.previewModal.mission.height){
    fail('Guardians preview modal score table no longer sits cleanly below the mission block', result);
  }

  console.log(JSON.stringify({ ok: true, result }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

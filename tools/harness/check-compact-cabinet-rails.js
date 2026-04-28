#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function inside(outer, inner, pad = 2){
  return !!outer && !!inner
    && inner.left >= outer.left - pad
    && inner.right <= outer.right + pad
    && inner.top >= outer.top - pad
    && inner.bottom <= outer.bottom + pad;
}

async function main(){
  const result = await withHarnessPage({
    skipStart: true,
    seed: 673810,
    viewport: { width: 673, height: 810 }
  }, async ({ page }) => page.evaluate(() => {
    if(typeof window.__galagaHarness__?.redraw === 'function') window.__galagaHarness__.redraw();
    const rectFor = id => {
      const el = document.getElementById(id);
      if(!el) return null;
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return {
        display: style.display,
        visibility: style.visibility,
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
        gridTemplateColumns: style.gridTemplateColumns
      };
    };
    const base = {
      viewport: { width: innerWidth, height: innerHeight },
      canvas: rectFor('c'),
      shell: rectFor('cabinetShell'),
      playfield: rectFor('playfieldFrame'),
      leftRail: rectFor('cabinetLeftFrame'),
      rightRail: rectFor('cabinetRightFrame'),
      pickerIcon: rectFor('gamePickerDockIcon'),
      platformIcon: rectFor('platformSplashDockIcon'),
      guideIcon: rectFor('guideDockBtn'),
      settingsIcon: rectFor('settingsBtn')
    };
    if(typeof installGamePack === 'function') installGamePack('galaxy-guardians-preview');
    if(typeof openGamePreview === 'function') openGamePreview();
    if(typeof resetGalaxyGuardiansPreviewRenderState === 'function') resetGalaxyGuardiansPreviewRenderState(1979);
    if(typeof window.__galagaHarness__?.redraw === 'function'){
      for(let i = 0; i < 16; i++) window.__galagaHarness__.redraw();
    }
    const canvas = document.getElementById('c');
    const canvasCtx = canvas.getContext('2d');
    const data = canvasCtx.getImageData(0, 0, canvas.width, canvas.height).data;
    const palette = { lit: 0, signalRed: 0, signalGold: 0, signalCyan: 0 };
    for(let i = 0; i < data.length; i += 4){
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      if(a > 0 && r + g + b > 48) palette.lit++;
      if(r > 150 && g < 130 && b < 140) palette.signalRed++;
      if(r > 160 && g > 130 && b < 90) palette.signalGold++;
      if(r < 150 && g > 150 && b > 150) palette.signalCyan++;
    }
    const milestones = Array.from(document.querySelectorAll('.gamePreviewMilestone')).map(el => {
      const rect = el.getBoundingClientRect();
      const badge = el.querySelector('b')?.getBoundingClientRect();
      const label = el.querySelector('span')?.getBoundingClientRect();
      return {
        text: el.textContent.replace(/\s+/g, ' ').trim(),
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
        badge: badge ? {
          left: badge.left,
          top: badge.top,
          right: badge.right,
          bottom: badge.bottom,
          width: badge.width
        } : null,
        label: label ? {
          left: label.left,
          top: label.top,
          right: label.right,
          bottom: label.bottom,
          width: label.width
        } : null
      };
    });
    return {
      ...base,
      preview: {
        modalOpen: !!document.getElementById('gamePreviewModal')?.classList.contains('open'),
        panel: rectFor('gamePreviewPanel'),
        close: rectFor('gamePreviewClose'),
        body: rectFor('gamePreviewBody'),
        image: rectFor('gamePreviewImage'),
        copy: rectFor('gamePreviewCopy'),
        highlights: rectFor('gamePreviewHighlights'),
        milestonesBox: rectFor('gamePreviewMilestones'),
        milestones,
        packKey: typeof currentGamePackKey === 'function' ? currentGamePackKey() : '',
        shouldDraw: typeof shouldDrawGalaxyGuardiansPreviewBoard === 'function' ? shouldDrawGalaxyGuardiansPreviewBoard() : null,
        started: typeof started === 'undefined' ? null : !!started,
        renderDebug: Object.assign({}, window.__galaxyGuardiansPreviewRenderDebug || {}),
        palette,
        playable: typeof currentGamePackHasPlayableAdapter === 'function' ? currentGamePackHasPlayableAdapter() : null
      }
    };
  }));

  for(const key of ['leftRail','rightRail','pickerIcon','platformIcon','guideIcon','settingsIcon']){
    const rect = result[key];
    if(!rect || rect.display === 'none' || rect.visibility === 'hidden' || rect.width < 16 || rect.height < 16){
      fail(`Compact cabinet ${key} is not visible at the in-app browser scale`, result);
    }
  }
  if(result.leftRail.right > result.playfield.left + 3){
    fail('Compact left rail overlaps the playfield instead of staying on the side frame', result);
  }
  if(result.rightRail.left < result.playfield.right - 3){
    fail('Compact right rail overlaps the playfield instead of staying on the side frame', result);
  }
  if(!result.preview?.modalOpen) fail('Galaxy Guardians preview modal did not open in compact layout', result);
  if(!inside(result.preview.panel, result.preview.close, 3)) fail('Preview close button is outside the panel bounds', result);
  if(!inside(result.preview.panel, result.preview.body, 3)) fail('Preview body is outside the panel bounds', result);
  if(!inside(result.preview.body, result.preview.image, 3)) fail('Preview image is outside the body bounds', result);
  if(!inside(result.preview.body, result.preview.copy, 3)) fail('Preview copy is outside the body bounds', result);
  if(!inside(result.preview.copy, result.preview.highlights, 3)) fail('Preview highlight list is outside the copy column', result);
  if(!inside(result.preview.copy, result.preview.milestonesBox, 3)) fail('Preview milestone list is outside the copy column', result);
  if(result.preview.copy.width < Math.min(300, result.preview.panel.width - 44)){
    fail('Compact preview copy column is too narrow for readable text', result);
  }
  if(result.preview.image.bottom > result.preview.copy.top - 2){
    fail('Compact preview body did not stack the splash image above the copy', result);
  }
  if(result.preview.image.height < 64){
    fail('Compact preview splash image collapsed instead of keeping a readable preview slot', result);
  }
  if(!/^\d+(\.\d+)?px$/.test(result.preview.body.gridTemplateColumns.trim())){
    fail('Compact preview body did not collapse to a single grid column', result);
  }
  if(result.preview.playable !== false){
    fail('Galaxy Guardians preview renderer made the preview pack look playable through an adapter', result);
  }
  if(result.preview.renderDebug.renderMode !== 'galaxy-guardians-dev-preview'){
    fail('Galaxy Guardians preview renderer did not claim the compact preview board', result);
  }
  for(const visualId of ['signal-flagship','signal-escort','signal-scout']){
    if(!result.preview.renderDebug.visualIds.includes(visualId)){
      fail(`Galaxy Guardians preview renderer did not render visual id ${visualId}`, result);
    }
  }
  for(const cueId of ['guardians-formation-pulse','guardians-player-single-shot']){
    if(!result.preview.renderDebug.audioCueIds.includes(cueId)){
      fail(`Galaxy Guardians preview renderer did not advance runtime cue id ${cueId}`, result);
    }
  }
  if(
    result.preview.palette.lit < 5000
    || result.preview.palette.signalRed < 80
    || result.preview.palette.signalGold < 80
    || result.preview.palette.signalCyan < 80
  ){
    fail('Galaxy Guardians preview renderer did not produce the expected distinct signal palette on canvas', result);
  }
  for(const milestone of result.preview.milestones){
    if(!inside(result.preview.milestonesBox, milestone, 3)){
      fail('Preview milestone item escapes the milestone list bounds', { result, milestone });
    }
    if(!inside(milestone, milestone.badge, 3)){
      fail('Preview milestone status badge is clipped or outside its row', { result, milestone });
    }
    if(milestone.badge.left <= milestone.label.right){
      fail('Preview milestone label overlaps its status badge', { result, milestone });
    }
  }

  console.log(JSON.stringify({
    ok: true,
    viewport: result.viewport,
    leftRail: result.leftRail,
    rightRail: result.rightRail,
    pickerIcon: result.pickerIcon,
    settingsIcon: result.settingsIcon,
    preview: {
      panel: result.preview.panel,
      bodyColumns: result.preview.body.gridTemplateColumns,
      copy: result.preview.copy,
      milestoneCount: result.preview.milestones.length,
      renderMode: result.preview.renderDebug.renderMode,
      visualIds: result.preview.renderDebug.visualIds,
      audioCueIds: result.preview.renderDebug.audioCueIds,
      palette: result.preview.palette
    }
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ skipStart: true, seed: 1979 }, async ({ page }) => {
    return page.evaluate(() => {
      installGamePack('galaxy-guardians-preview', { persist: false });
      getDevPreviewGameplayAdapter('galaxy-guardians-preview').start({ stage: 1, ships: 3, seed: 1979 });

      let minShotDx = Infinity;
      let minDiveDx = Infinity;
      let firstNearShotT = null;
      let firstNearDiveT = null;
      let nearShotMoments = 0;
      let nearDiveMoments = 0;
      const snapshots = [];

      for(let i = 0; i < 60 * 24; i++){
        stepGalaxyGuardiansRuntime(currentGalaxyGuardiansDevPreviewState(), 1 / 60, {
          left: 0,
          right: 0,
          fire: 1
        });
        const state = currentGalaxyGuardiansDevPreviewState();
        const player = state.player || { x: 0, y: 0 };

        for(const shot of state.enemyShots || []){
          if(!shot || shot.active === 0) continue;
          const dx = Math.abs((+shot.x || 0) - (+player.x || 0));
          const yGap = (+player.y || 0) - (+shot.y || 0);
          if(dx < minShotDx) minShotDx = dx;
          if(dx <= 18 && yGap >= 0 && yGap <= 120){
            nearShotMoments++;
            if(firstNearShotT === null) firstNearShotT = +(state.t || 0).toFixed(3);
          }
        }

        for(const alien of state.aliens || []){
          if(alien.hp <= 0 || (alien.mode !== 'diving' && alien.mode !== 'wrapping')) continue;
          const dx = Math.abs((+alien.x || 0) - (+player.x || 0));
          const yGap = (+player.y || 0) - (+alien.y || 0);
          if(dx < minDiveDx) minDiveDx = dx;
          if(dx <= 20 && yGap >= -8 && yGap <= 140){
            nearDiveMoments++;
            if(firstNearDiveT === null) firstNearDiveT = +(state.t || 0).toFixed(3);
          }
        }

        if(i % 180 === 0){
          snapshots.push({
            t: +(state.t || 0).toFixed(2),
            score: +state.score || 0,
            lives: +state.lives || 0,
            enemyShots: (state.enemyShots || []).filter(shot => shot && shot.active !== 0).length,
            activeDives: (state.aliens || []).filter(alien => alien.hp > 0 && (alien.mode === 'diving' || alien.mode === 'wrapping')).length
          });
        }

        if(state.gameOver) break;
      }

      return {
        currentPackKey: typeof currentGamePackKey === 'function' ? currentGamePackKey() : '',
        minShotDx: Number.isFinite(minShotDx) ? +minShotDx.toFixed(2) : null,
        minDiveDx: Number.isFinite(minDiveDx) ? +minDiveDx.toFixed(2) : null,
        firstNearShotT,
        firstNearDiveT,
        nearShotMoments,
        nearDiveMoments,
        snapshots,
        final: summarizeGalaxyGuardiansRuntime(currentGalaxyGuardiansDevPreviewState())
      };
    });
  });

  if(result.currentPackKey !== 'galaxy-guardians-preview'){
    fail('Stationary safe-lane check did not run from the Guardians pack.', result);
  }
  if((result.nearShotMoments || 0) < 1 && (result.nearDiveMoments || 0) < 1){
    fail('A stationary center player never faced a nearby shot or dive threat.', result);
  }
  if(
    result.firstNearShotT === null
    && result.firstNearDiveT === null
  ){
    fail('Stationary safe-lane check found no timed near-threat moment.', result);
  }
  const firstThreatT = Math.min(
    result.firstNearShotT ?? Infinity,
    result.firstNearDiveT ?? Infinity
  );
  if(!Number.isFinite(firstThreatT) || firstThreatT > 18){
    fail('Stationary safe-lane check allowed the center lane to remain safe too long.', result);
  }

  console.log(JSON.stringify({
    ok: true,
    firstThreatT,
    minShotDx: result.minShotDx,
    minDiveDx: result.minDiveDx,
    nearShotMoments: result.nearShotMoments,
    nearDiveMoments: result.nearDiveMoments,
    final: {
      score: result.final?.score || 0,
      lives: result.final?.lives || 0,
      stage: result.final?.stage || 0,
      enemyShotCount: result.final?.enemyShotCount || 0,
      wrappingCount: result.final?.wrappingCount || 0
    }
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

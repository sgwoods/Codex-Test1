#!/usr/bin/env node
const { withHarnessPage } = require('./browser-check-util');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

async function main(){
  const result = await withHarnessPage({ stage: 2, ships: 3, challenge: false, seed: 61021 }, async ({ page }) => {
    await page.evaluate(() => window.__galagaHarness__.exportAndReset({ label: 'pack_rule_adapters_wait' }));
    return page.evaluate(() => {
      const packSummary = key => {
        const pack = getGamePack(key);
        const combat = currentGamePackCombatRules(pack);
        const progression = currentGamePackProgressionRules(pack);
        const family = currentGamePackEnemyFamilyRules(pack);
        const scoring = currentGamePackScoringRules(pack);
        const events = currentGamePackEventSchema(pack);
        return {
          key,
          title: pack.metadata.title,
          playerBulletCap: combat.playerBulletCap,
          challengeFirstStage: progression.stageCadence.challengeFirstStage,
          challengeEvery: progression.stageCadence.challengeEvery,
          firstFormation: progression.formationLayouts[0],
          firstProfile: family.stageBandProfiles[0],
          captureRescue: !!family.capabilities.usesCaptureRescue,
          dualFighter: !!family.capabilities.usesDualFighterMode,
          scoring: {
            challengeEnemy: scoring.challengeEnemy,
            rescueJoin: scoring.rescueJoin,
            beeFormation: scoring.enemyKills.bee.formation,
            bossDiveSolo: scoring.enemyKills.boss.dive.solo
          },
          eventAliases: events.aliases || {}
        };
      };
      const explicitAliases = {
        auroraStageSpawn: currentGamePackSemanticEventType('stage_spawn', 'aurora-galactica'),
        guardiansStageSpawn: currentGamePackSemanticEventType('stage_spawn', 'galaxy-guardians-preview'),
        guardiansEnemyBullet: currentGamePackSemanticEventType('enemy_bullet_fired', 'galaxy-guardians-preview'),
        guardiansShipLost: currentGamePackSemanticEventType('ship_lost', 'galaxy-guardians-preview')
      };
      installGamePack('galaxy-guardians-preview', { persist: false });
      const installed = {
        key: currentGamePackKey(),
        bulletSingle: currentGamePackPlayerBulletCap(false),
        bulletDual: currentGamePackPlayerBulletCap(true),
        challengeStage2: currentGamePackIsChallengeStage(2),
        challengeStage999: currentGamePackIsChallengeStage(999),
        stageSpawnAlias: currentGamePackSemanticEventType('stage_spawn')
      };
      installGamePack('aurora-galactica', { persist: false });
      const restored = {
        key: currentGamePackKey(),
        bulletSingle: currentGamePackPlayerBulletCap(false),
        bulletDual: currentGamePackPlayerBulletCap(true),
        challengeStage3: currentGamePackIsChallengeStage(3),
        stageSpawnAlias: currentGamePackSemanticEventType('stage_spawn')
      };
      return {
        aurora: packSummary('aurora-galactica'),
        guardians: packSummary('galaxy-guardians-preview'),
        explicitAliases,
        installed,
        restored
      };
    });
  });

  if(result.aurora.playerBulletCap.single !== 2 || result.aurora.playerBulletCap.dual !== 4){
    fail('Aurora combat adapter returned the wrong bullet caps', result);
  }
  if(result.guardians.playerBulletCap.single !== 1 || result.guardians.playerBulletCap.dual !== 1){
    fail('Galaxy Guardians combat adapter returned the wrong bullet caps', result);
  }
  if(result.aurora.challengeFirstStage !== 3 || result.aurora.challengeEvery !== 4){
    fail('Aurora progression adapter returned the wrong challenge cadence', result);
  }
  if(result.guardians.challengeFirstStage !== 999 || result.guardians.challengeEvery !== 999){
    fail('Galaxy Guardians progression adapter should suppress challenge stages in the preview', result);
  }
  if(!result.aurora.captureRescue || !result.aurora.dualFighter){
    fail('Aurora family adapter lost capture/rescue or dual-fighter capabilities', result);
  }
  if(result.guardians.captureRescue || result.guardians.dualFighter){
    fail('Galaxy Guardians family adapter leaked Aurora capabilities', result);
  }
  if(result.aurora.scoring.challengeEnemy !== 100 || result.aurora.scoring.rescueJoin !== 1000){
    fail('Aurora scoring adapter returned the wrong scoring rules', result);
  }
  if(result.guardians.scoring.challengeEnemy !== 0 || result.guardians.scoring.rescueJoin !== 0){
    fail('Galaxy Guardians scoring adapter returned the wrong scoring rules', result);
  }
  if(result.explicitAliases.auroraStageSpawn){
    fail('Aurora should not alias stage_spawn through the Galaxy Guardians event schema', result);
  }
  if(result.explicitAliases.guardiansStageSpawn !== 'wave_setup'
    || result.explicitAliases.guardiansEnemyBullet !== 'enemy_projectile'
    || result.explicitAliases.guardiansShipLost !== 'player_hit'){
    fail('Galaxy Guardians event schema adapter returned the wrong semantic aliases', result);
  }
  if(result.installed.key !== 'galaxy-guardians-preview'
    || result.installed.bulletSingle !== 1
    || result.installed.bulletDual !== 1
    || result.installed.challengeStage2
    || !result.installed.challengeStage999
    || result.installed.stageSpawnAlias !== 'wave_setup'){
    fail('Installed Galaxy Guardians adapter state is wrong', result);
  }
  if(result.restored.key !== 'aurora-galactica'
    || result.restored.bulletSingle !== 2
    || result.restored.bulletDual !== 4
    || !result.restored.challengeStage3
    || result.restored.stageSpawnAlias){
    fail('Restored Aurora adapter state is wrong', result);
  }

  console.log(JSON.stringify({
    ok: true,
    aurora: {
      bulletCap: result.aurora.playerBulletCap,
      challengeFirstStage: result.aurora.challengeFirstStage,
      scoring: result.aurora.scoring
    },
    guardians: {
      bulletCap: result.guardians.playerBulletCap,
      challengeFirstStage: result.guardians.challengeFirstStage,
      scoring: result.guardians.scoring,
      aliases: result.guardians.eventAliases
    }
  }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

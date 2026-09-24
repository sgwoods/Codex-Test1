#!/usr/bin/env node
const { loadGuardiansVm } = require('./guardians-long-surface-lib');

try {
  const ctx = loadGuardiansVm();
  const policy = ctx.GALAXY_GUARDIANS_PACK.stageBehaviorPolicies?.rank3;
  if(policy?.id !== 'guardians-stage-five-active-dive-cap-v5') throw new Error('Stage 5 is not using the promoted active-dive-cap-v5 policy.');
  if(policy.minRank !== 3 || policy.maxRank !== 3) throw new Error('Stage 5 policy is not bounded to rank three.');
  if(policy.diveSelection?.maxActiveDives !== 2) throw new Error('Stage 5 active-dive ceiling must remain two.');

  const state = ctx.createGalaxyGuardiansRuntimeState({ stage: 5, ships: 5, seed: 12553, maxPlayableStage: 9 });
  state.player.inv = 999;
  let maxActiveDives = 0;
  for(let frame = 0; frame < 36 * 60; frame++){
    ctx.stepGalaxyGuardiansRuntime(state, 1 / 60, ctx.galaxyGuardiansHarnessPersonaInput(state, 'professional'));
    const summary = ctx.summarizeGalaxyGuardiansRuntime(state);
    const active = (summary.activeDives || []).filter(dive => dive.mode === 'diving' || dive.mode === 'wrapping').length;
    maxActiveDives = Math.max(maxActiveDives, active);
  }
  if(maxActiveDives > 2) throw new Error(`Stage 5 exceeded the promoted two-dive ceiling: ${maxActiveDives}.`);

  const stage5 = ctx.guardiansRuntimeRules(5);
  const stage3 = ctx.guardiansRuntimeRules(3);
  if(stage5.enemyShotVy !== 128.563 || stage5.enemyShotIntervalBase !== 0.987 || stage5.singleShotCooldown !== 0.72){
    throw new Error(`Stage 5 projectile lock changed: ${JSON.stringify({ enemyShotVy: stage5.enemyShotVy, enemyShotIntervalBase: stage5.enemyShotIntervalBase, singleShotCooldown: stage5.singleShotCooldown })}`);
  }
  if(ctx.GALAXY_GUARDIANS_PACK.stageBehaviorPolicies.rank3.minRank <= ctx.guardiansStageRank(3)) throw new Error('Stage 5 policy leaks into Stage 3.');

  console.log(JSON.stringify({ ok: true, policyId: policy.id, rankScope: [policy.minRank, policy.maxRank], maxActiveDives, projectileLock: { enemyShotVy: stage5.enemyShotVy, enemyShotIntervalBase: stage5.enemyShotIntervalBase, singleShotCooldown: stage5.singleShotCooldown }, stage3Rank: ctx.guardiansStageRank(3), stage3EnemyShotVy: stage3.enemyShotVy }, null, 2));
} catch(err){
  console.error(err && err.stack || String(err));
  process.exit(1);
}

#!/usr/bin/env node
const assert = require('assert/strict');
const { loadGuardiansVm } = require('./guardians-long-surface-lib');

function launchFixture(ctx, stage, { existing = 0, escortXs = [80,112], leaderX = 48, leaderY = 40,
 existingX = 240, existingY = 40 } = {}){
 const state = ctx.createGalaxyGuardiansRuntimeState({ stage, ships: 5, seed: 12553, maxPlayableStage: 9 });
 const leader = state.aliens.find(a => a.role === 'flagship');
 const escorts = state.aliens.filter(a => a.role === 'escort').slice(0, escortXs.length);
 const scouts = state.aliens.filter(a => a.role === 'scout').slice(0, existing);
 state.aliens = [leader, ...escorts, ...scouts];
 state.player.x = 140;
 for(const alien of state.aliens){ alien.mode = 'formation'; alien.y = 40; }
 leader.x = leader.rackX = leaderX;
 leader.y = leaderY;
 escorts.forEach((alien, i) => { alien.x = alien.rackX = escortXs[i]; });
 scouts.forEach(alien => { alien.mode = 'diving'; alien.x = alien.rackX = existingX; alien.y = existingY; });
 const launched = ctx.startGuardiansDive(state, leader, 2);
 return { state, leader, escorts, launched,
  active: state.aliens.filter(a => a.mode === 'diving' || a.mode === 'wrapping').length };
}

try {
  const ctx = loadGuardiansVm();
  const policy = ctx.GALAXY_GUARDIANS_PACK.stageBehaviorPolicies?.rank3;
  if(policy?.id !== 'guardians-stage-five-active-dive-cap-v5') throw new Error('Stage 5 is not using the promoted active-dive-cap-v5 policy.');
  if(policy.minRank !== 3 || policy.maxRank !== 3) throw new Error('Stage 5 policy is not bounded to rank three.');
  if(policy.diveSelection?.maxActiveDives !== 2) throw new Error('Stage 5 active-dive ceiling must remain two.');

  const deterministic = [];
  for(const stage of [5,6]){
    for(const existing of [0,1,2]){
      const r = launchFixture(ctx, stage, { existing });
      assert.equal(r.active, 2, `Stage ${stage}, existing ${existing}: active capacity`);
      assert.equal(r.leader.escorts, existing === 0 ? 1 : 0);
      assert.equal(!!r.launched, existing < 2);
      if(existing === 0){
        assert.equal(r.escorts[0].linkedTo, r.leader.id);
        assert.equal(r.escorts[0].escortSlot, -1);
        assert.equal(r.escorts[0].diveT, -ctx.guardiansRuntimeRules(stage).escortLag);
        assert.equal(r.escorts[1].mode, 'formation');
      }
      deterministic.push({ stage, existing, active: r.active, escorts: r.leader.escorts });
    }
    for(const [x, accepted] of [[79.999,false],[80,true],[114,false],[113.999,true]]){
      const r = launchFixture(ctx, stage, { escortXs: [x] });
      assert.equal(r.leader.escorts, accepted ? 1 : 0, `Stage ${stage}, escort X ${x}: policy edge`);
    }
    const laterEligible = launchFixture(ctx, stage, { escortXs: [79.999,80] });
    assert.equal(laterEligible.escorts[0].mode, 'formation');
    assert.equal(laterEligible.escorts[1].linkedTo, laterEligible.leader.id);
    for(const [x, accepted] of [[87.999,false],[88,true]]){
      const r = launchFixture(ctx, stage, { leaderY: 200, escortXs: [x] });
      assert.equal(r.leader.escorts, accepted ? 1 : 0, `Stage ${stage}: escort lower-field 40px edge`);
    }
    for(const [leaderX, launched] of [[80,true],[80.001,false]]){
      const r = launchFixture(ctx, stage, { existing: 1, existingX: 120, existingY: 200, leaderX, escortXs: [] });
      assert.equal(!!r.launched, launched, `Stage ${stage}: lower-field 40px edge`);
    }
    for(const leaderX of [114,166]){
      const r = launchFixture(ctx, stage, { leaderX });
      assert.equal(r.launched, null, `Stage ${stage}: leader corridor edge`);
      assert.equal(r.active, 0);
    }
  }
  for(const existing of [0,1]){
    const r = launchFixture(ctx, 1, { existing });
    assert.equal(r.active, existing + 3, 'Stage 1 retains two-escort launch');
    assert.equal(r.leader.escorts, 2);
    r.escorts.forEach((escort, i) => {
      assert.equal(escort.linkedTo, r.leader.id);
      assert.equal(escort.escortSlot, i === 0 ? -1 : 1);
      assert.equal(escort.diveT, -ctx.guardiansRuntimeRules(1).escortLag * (i + 1));
    });
    deterministic.push({ stage: 1, existing, active: r.active, escorts: r.leader.escorts });
  }
  console.log(JSON.stringify({ deterministic }));

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

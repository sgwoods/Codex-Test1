#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const { ROOT, withHarnessPage } = require('./browser-check-util');
const { DIST_DEV } = require('../build/paths');

async function main(){
  const move = process.argv.slice(2).find(arg => arg.startsWith('--move='))?.slice(7) || 'none';
  assert.ok(['none','left10','left20','right10','right20'].includes(move), 'Unknown movement probe');
  const seconds = (name, fallback) => {
    const arg = process.argv.slice(2).find(value => value.startsWith(`--${name}=`));
    return arg ? Number(arg.slice(name.length + 3)) : fallback;
  };
  const from = seconds('from', 3), to = seconds('to', 9);
  assert.ok(Number.isFinite(from) && Number.isFinite(to) && from >= 0 && to >= from && to <= 30,
    'Shot range must be finite, ordered and within 0-30 seconds');
  const firstFrame = Math.ceil(from * 60), lastFrame = Math.floor(to * 60);
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
  const build = JSON.parse(fs.readFileSync(path.join(DIST_DEV, 'build-info.json'), 'utf8'));
  assert.equal(build.commit, commit);
  const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const bundleHash = hash(path.join(DIST_DEV, 'index.html'));
  const result = await withHarnessPage({ skipStart: true, stage: 31 }, async ({ page }) => page.evaluate(({ move, firstFrame, lastFrame }) => {
    const h = window.__galagaHarness__, trials = [];
    for(let launchFrame = firstFrame; launchFrame <= lastFrame; launchFrame += 6){
      h.resetInputState('shot-witness');
      h.showFrontDoor();
      h.start({ controlledClock: true, stageMode: 'display', startKind: 'challenge',
        challengeStage: 8, stage: 31, ships: 3, persona: null, expertPlays: 'human',
        playerTwo: false, autoVideo: false, seed: 9131 });
      const targets = h.challengeFormationState().enemies;
      const initial = h.snapshot();
      if(initial.simT !== 0 || initial.score !== 0 || targets.length !== 40)throw new Error('Trial did not restart cleanly');
      const moveTicks = move === 'none' ? 0 : Number(move.match(/\d+$/)[0]);
      const code = move.startsWith('left') ? 'ArrowLeft' : 'ArrowRight';
      if(moveTicks)window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles:true }));
      for(let frame = 0; frame < launchFrame; frame++){
        if(frame === moveTicks && moveTicks)window.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles:true }));
        h.advanceFor(1/60, { step: 1/60 });
      }
      const before = h.snapshot();
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true }));
      h.advanceFor(1/60, { step: 1/60 });
      window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', key: ' ', bubbles: true }));
      for(let frame = 0; frame < 60 && h.snapshot().counts.playerBullets; frame++)h.advanceFor(1/60, { step: 1/60 });
      const events = h.recentEvents({ count: 300 });
      const shots = events.filter(e => e.type === 'player_shot');
      if(shots.length !== 1)throw new Error('Trial did not produce exactly one shot: '+JSON.stringify({launchFrame, before, input:h.inputState(), events:events.slice(-8)}));
      if(shots[0].shots !== 1 || shots[0].dual !== false || shots[0].shotXs.length !== 1 || Math.abs(shots[0].shotXs[0]-before.player.x)>0.02)throw new Error('Trial is not one stationary single-ship bullet');
      const kills = events.filter(e => e.type === 'enemy_killed');
      if(kills.some(event => !targets.some(target => target.id === event.id)))throw new Error('Kill has no initial target identity');
      if(h.snapshot().counts.playerBullets)throw new Error('Shot trial timed out');
      trials.push({ launchFrame, launchTime: before.simT, player: before.player, shots,
        kills: kills.map(event => ({ event, target: targets.find(target => target.id === event.id) })),
        final: h.snapshot() });
    }
    h.resetInputState('shot-witness-complete');
    return { stage: 31, seed: 9131, move, firstFrame, lastFrame, trials };
  }, { move, firstFrame, lastFrame }));
  assert.equal(hash(path.join(DIST_DEV, 'index.html')), bundleHash);
  const out = path.join(ROOT, 'reference-artifacts/analyses/challenge-shot-witnesses',
    `${new Date().toISOString().replace(/[:.]/g, '-')}-${commit.slice(0,8)}`);
  fs.mkdirSync(out, { recursive: true });
  const report = { commit, build, bundleHash, methodHash: hash(__filename),
    method: `Natural challenge restart per trial; optional initial arrow-key movement then stationary one Space-key shot, 60Hz updates, launch every six ticks from${from} through${to}s; full board interception retained.`,
    limitations: ['Sampled firing columns only; missing witnesses do not imply impossible targets.',
      'Tap/reversal input uses wall-clock time; compare recorded shot X, not movement option alone, across machines.',
      'Independent restarts cannot establish a complete perfect route or human reaction/readability.',
      'No player or enemy position assignment; development harness launch, not public flow.'], result };
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report,null,2)+'\n');
  const green = result.trials.flatMap(t => t.kills.filter(k => k.target?.pathFamily === 'green-ladder-split').map(k => ({ launchTime:t.launchTime, lane:k.target.lane, id:k.event.id })));
  console.log(JSON.stringify({ out, trials:result.trials.length, green },null,2));
}
main().catch(error => { console.error(error); process.exitCode=1; });

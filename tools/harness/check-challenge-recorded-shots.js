#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { ROOT } = require('./browser-check-util');
const { run, audit } = require('./feasibility-pilot');

async function main() {
  const args = process.argv.slice(2);
  const value = (name, fallback) => args.find(arg => arg.startsWith(`--${name}=`))?.slice(name.length + 3) || fallback;
  const root = path.resolve(value('root', path.join(ROOT, 'dist/dev')));
  const baseline = path.resolve(value('baseline', path.join(ROOT, 'private-artifacts/blue-path-setup-oct13/baseline/build')));
  const input = path.resolve(value('inputs', path.join(ROOT, 'private-artifacts/blue-path-setup-oct13/baseline/replay-evidence/shots.json')));
  const out = path.resolve(value('out', '/tmp/challenge-recorded-shots.json'));
  const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const saved = JSON.parse(fs.readFileSync(input));
  const report = { methodHash: hash(__filename), dependencyHash: hash(path.join(__dirname, 'feasibility-pilot.js')),
    inputHash: hash(input), baselineHash: hash(path.join(baseline, 'index.html')),
    candidateHash: hash(path.join(root, 'index.html')), results: {}, pass: false,
    limits: ['Three saved input traces, one seed per stage; not proof of perfect feasibility or all human inputs.',
      'Changed hit/shot timing is recorded for review; preserved target IDs, score, input physics and natural completion define regression success.'] };
  const events = result => result.events.filter(event => ['player_shot', 'enemy_killed', 'ship_lost'].includes(event.type));
  const save = () => {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(report) + '\n');
  };
  for (const stage of [31, 35, 39]) {
    const { cfg, candidate } = saved.results[stage];
    assert.equal(cfg.stage, stage);
    const a = await run(baseline, cfg, candidate.trace, { completeStage: true });
    const b = await run(root, cfg, candidate.trace, { completeStage: true });
    const baselineAudit = audit(a, cfg), candidateAudit = audit(b, cfg);
    const kills = result => result.events.filter(event => event.type === 'enemy_killed');
    const lost = kills(a).filter(event => !kills(b).some(next => next.id === event.id));
    const gained = kills(b).filter(event => !kills(a).some(next => next.id === event.id));
    const changed = kills(a).flatMap(event => {
      const next = kills(b).find(next => next.id === event.id);
      return next && next.t !== event.t ? [{ id: event.id, baselineTime: event.t, candidateTime: next.t }] : [];
    });
    const inputFrames = candidate.trace.length;
    const inputParity = JSON.stringify(a.trace.slice(0,inputFrames)) === JSON.stringify(b.trace.slice(0,inputFrames));
    const playerParity = a.frames.slice(0,inputFrames).every((frame,index) =>
      JSON.stringify(frame.actualPlayer) === JSON.stringify(b.frames[index]?.actualPlayer));
    const orderedEventsExact = JSON.stringify(events(a)) === JSON.stringify(events(b));
    const errors = [];
    if (baselineAudit.errors.length || candidateAudit.errors.length) errors.push('Normal-input physics audit failed');
    if (!inputParity || !playerParity) errors.push('Recorded input or player motion changed');
    if (lost.length || candidateAudit.kills < baselineAudit.kills) errors.push('Previously demonstrated target hits lost');
    if (b.final.score < a.final.score) errors.push('Score decreased');
    if (baselineAudit.kills !== ({ 31: 37, 35: 33, 39: 37 })[stage]) errors.push('Baseline no longer reproduces retained kills');
    if (candidateAudit.shipLossEvents.length) errors.push('Candidate loses a ship');
    if (!baselineAudit.clear || !candidateAudit.clear || a.final.stage !== stage+1 || b.final.stage !== stage+1) errors.push('Natural clear/next-stage spawn missing');
    report.results[stage] = { cfg, inputFrames, baselineAudit, candidateAudit, inputParity, playerParity,
      orderedEventsExact, lost, gained, changed, errors, baseline: a, candidate: b };
    save();
  }
  assert.equal(hash(path.join(baseline, 'index.html')), report.baselineHash, 'Baseline changed during check');
  assert.equal(hash(path.join(root, 'index.html')), report.candidateHash, 'Candidate changed during check');
  report.pass = Object.values(report.results).every(result => result.errors.length === 0);
  save();
  console.log(JSON.stringify({ out, pass: report.pass, results: Object.fromEntries(Object.entries(report.results)
    .map(([stage, result]) => [stage, { kills: result.candidateAudit.kills, shots: result.candidateAudit.shots,
      orderedEventsExact: result.orderedEventsExact, lost: result.lost.length, gained: result.gained.length,
      changedHitTimes: result.changed.length, clear: result.candidateAudit.clear?.t, errors: result.errors }])) }));
  if (!report.pass) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });

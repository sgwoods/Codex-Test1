const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');
const assert = require('assert/strict');
const root = path.resolve(__dirname, '../..');
const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file)));
const paths = ['analyses/late-challenge-contacts/2026-10-11T14-24-25-159Z-cf0e7a66/report.json',
 'analyses/late-challenge-contacts/2026-10-11T14-26-52-905Z-cf0e7a66/report.json'];
const [a,b] = paths.map(read);
assert.equal(a.methodHash,b.methodHash);
const before = a.results[0], after = b.results[0];
const fields = row => ({ t:row.t, x:row.x, y:row.y, u:row.u, full:row.full });
let preserved = 0, changed = 0;
const targetRows = before.targets.map(t => {
 const c = after.targets.find(x => x.id === t.id);
 const pre = t.pathFamily === 'green-ladder-split' ? t.trajectory.filter(x => x.u < 9.7) : t.trajectory;
 const candidatePre = t.pathFamily === 'green-ladder-split' ? c.trajectory.filter(x => x.u < 9.7) : c.trajectory;
 assert.deepEqual(candidatePre.map(fields),pre.map(fields));
 preserved += pre.length;
 changed += t.longestFullSeconds > c.longestFullSeconds ? 1 : 0;
 const jumps = row => row.trajectory.slice(1).map((p,i) => ({ distance:Math.hypot(p.x-row.trajectory[i].x,p.y-row.trajectory[i].y),
  phase:p.phase, u:p.u, previousU:row.trajectory[i].u }));
 const max = list => Math.max(0,...list.map(x=>x.distance));
 return { id:t.id, family:t.pathFamily, beforeLongest:t.longestFullSeconds, afterLongest:c.longestFullSeconds,
  beforeJump:max(jumps(t)), afterJump:max(jumps(c)),
  beforeExitJump:max(jumps(t).filter(x=>x.u>=9.7)), afterExitJump:max(jumps(c).filter(x=>x.u>=9.7)) };
});
for(let i=1;i<3;i++)assert.deepEqual(b.results[i],a.results[i]);
const shotRoot = path.join(root,'analyses/challenge-shot-witnesses');
const shots = fs.readdirSync(shotRoot).filter(d=>d.startsWith('2026-10-11T14-2')).map(d=>{
 const file=path.join(shotRoot,d,'report.json'),r=JSON.parse(fs.readFileSync(file));
 const variant=r.bundleHash===a.bundleHash?'baseline':r.bundleHash===b.bundleHash?'candidate':null;
 if(!variant)return null;
 return { variant,move:r.result.move,path:file,hash:hash(file),methodHash:r.methodHash,
  trials:r.result.trials.length,
  playerXs:[...new Set(r.result.trials.map(t=>t.player.x))],playerVxs:[...new Set(r.result.trials.map(t=>t.player.vx))],
  green:r.result.trials.flatMap(t=>t.kills.filter(k=>k.target.pathFamily==='green-ladder-split').map(k=>({id:k.event.id,time:t.launchTime,x:t.player.x}))),
  targetWitnesses:r.result.trials.filter(t=>t.kills.some(k=>k.event.id===372665405)).map(t=>({time:t.launchTime,x:t.player.x})) };
}).filter(Boolean);
assert.equal(shots.length,10);
const report = { verdict:'REJECTED; source restored',baseline:a.commit,
 contacts:{before:before.contacts,after:after.contacts},completed:{before:before.completed,after:after.completed},
 fullEntry:{before:before.targets.filter(t=>t.fullFrames>0).length,after:after.targets.filter(t=>t.fullFrames>0).length},
 combat:{before:[before.maximumEnemyBullets,before.maximumAttackers],after:[after.maximumEnemyBullets,after.maximumAttackers]},
 preservedSamples:preserved,visibilityLosses:changed,targetRows,unchangedStages:[35,39],
 sourceHashes:{baseline:a.sourceHashes,candidate:b.sourceHashes},bundleHashes:{baseline:a.bundleHash,candidate:b.bundleHash},
 contactReports:paths.map(p=>({path:path.join(root,p),hash:hash(path.join(root,p))})),
 patchHash:hash(path.join(__dirname,'candidate.patch')),shots,
 limitations:['Single seed9131, 60Hz; no canonical coordinate/tolerance claim.',
  'Five ordinary-input columns,31 independent one-shot trials each; replacement times allowed; no full-route feasibility proof.',
  'Movement depends partly on wall-clock release; recorded shipX ranges differ, so movement labels alone are not exact column matches.',
  'Stage3 preservation is source-scoped, not rerun in this packet. Stages35/39 actual reports match exactly.',
  'Candidate remains in isolated dist for evidence only; restored source is baseline, not that bundle.'] };
fs.writeFileSync(path.join(__dirname,'comparison.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({verdict:report.verdict,fullEntry:report.fullEntry,visibilityLosses:changed,
 preservedSamples:preserved,target:targetRows.find(t=>t.id===372665405),
 shots:shots.map(({green,...s})=>({...s,greenHits:green.length}))},null,2));

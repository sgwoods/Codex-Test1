const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const { createHash } = require('crypto');
const root = path.resolve(__dirname, '../../..');
const baselineRoot = '/private/tmp/aurora-earlier-shots-baseline-oct11';
const privateRoot = path.join(root, 'private-artifacts/repo-mirror/reference-artifacts/analyses/earlier-shots-oct11');
fs.mkdirSync(privateRoot, { recursive: true });
const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const retained = path.join(__dirname, 'retained-candidate-build');
if(fs.existsSync(retained))fs.renameSync(retained, path.join(privateRoot, 'retained-candidate-build'));
const provenance = JSON.parse(fs.readFileSync(path.join(root, 'reference-artifacts/analyses/green-exit-trial-oct11/comparison.json')));
const trajectory = JSON.parse(fs.readFileSync(provenance.contactReports[1].path)).results[0].targets.find(t=>t.id===372665405).trajectory;
const rows = [];
for(const [variant, checkout] of [['candidate', root], ['baseline', baselineRoot]]){
 const dir = path.join(checkout, 'reference-artifacts/analyses/challenge-shot-witnesses');
 for(const name of fs.readdirSync(dir).filter(d=>d.startsWith('2026-10-11T14-4'))){
  const file = path.join(dir,name,'report.json'), r = JSON.parse(fs.readFileSync(file));
  if(!['right30','right40'].includes(r.result.move))continue;
  assert.equal(r.commit, 'cf0e7a666067ede385865ba02e73d1454eb132d1');
  if(variant==='candidate')assert.equal(r.bundleHash, provenance.bundleHashes.candidate);
  const archive = path.join(privateRoot, variant+'-'+name+'.json');
  fs.copyFileSync(file, archive);
  const firstHitCounts = {}, witnesses = [];
  let misses = 0;
  for(const t of r.result.trials){
   assert.equal(t.shots.length,1); assert.equal(t.shots[0].shots,1);
   assert.equal(t.shots[0].dual,false); assert.equal(t.player.vx,0);
   assert.equal(t.shots[0].shotXs.length,1);
   assert(Math.abs(t.shots[0].shotXs[0]-t.player.x)<.02);
   assert(t.kills.length<=1);
   const first = t.kills[0];
   if(!first){ misses++; continue; }
   firstHitCounts[first.event.id] = (firstHitCounts[first.event.id]||0)+1;
   if(first.event.id===372665405){
    assert.equal(first.target.pathFamily,'green-ladder-split');
    const pose = trajectory.reduce((a,b)=>Math.abs(b.t-first.event.t)<Math.abs(a.t-first.event.t)?b:a);
    witnesses.push({ launchTime:t.launchTime, killTime:first.event.t, shipX:t.player.x, shipVx:t.player.vx,
     targetId:first.event.id, shot:t.shots[0], closestNoFirePose:{...pose,
      timeDifference:pose.t-first.event.t},
     poseQualification:'Matched no-fire trace sample, not a direct shot-run sprite measurement.' });
   }
  }
  rows.push({ variant, move:r.result.move, trials:r.result.trials.length, firstFrame:r.result.firstFrame,
   lastFrame:r.result.lastFrame, originalPath:file, rawPrivatePath:archive, rawHash:hash(archive),
   bundleHash:r.bundleHash, methodHash:r.methodHash, build:r.build,
   firstHitCounts, misses, targetHits:witnesses.length,
   otherFirstHits:r.result.trials.length-misses-witnesses.length,
   shipXs:[...new Set(r.result.trials.map(t=>t.player.x))], witnesses });
 }
}
assert.equal(rows.length,6);
assert.equal(new Set(rows.map(r=>r.methodHash)).size,1);
const summary = { baseline:provenance.baseline, targetId:372665405, seed:9131,
 generatedAt:new Date().toISOString(), methodHash:rows[0].methodHash,
 sourceIdentity:{candidateTestedEnemySourceHash:provenance.sourceHashes.candidate['06-enemy-behavior.js'],
  candidateSourceBinding:'Prior hash-bound diagnosis and preserved candidate bundle; current checkout source is restored baseline.',
  currentCandidateCheckoutEnemySourceHash:hash(path.join(root,'src/js/06-enemy-behavior.js')),
  baselineEnemySourceHash:hash(path.join(baselineRoot,'src/js/06-enemy-behavior.js')),
  candidatePatchHash:provenance.patchHash},
 preservedCandidateBundleHash:hash(path.join(privateRoot,'retained-candidate-build/index.html')),
 conclusions:['Earlier real target interceptions found in both candidate and separately built baseline.',
  'Earlier witnesses qualify the prior9-12s sampled absence; they do not accept the rejected exit or fix its completion defect.'],
 limitations:['One seed, two reachable far-right columns; independent one-shot restarts, not a full route.',
  'Movement release is partly wall-clock dependent; compare actual shipX and shotX, not move labels alone.',
  'Some early/late hits occur near clipped target boundaries; matched no-fire poses are diagnostic only.',
  'No audio/readability/perfect feasibility acceptance; no gameplay path edits or candidate rebuild.'], rows };
fs.writeFileSync(path.join(__dirname,'summary.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(rows.map(({witnesses,build,...r})=>({...r,times:witnesses.map(w=>w.launchTime)})),null,2));

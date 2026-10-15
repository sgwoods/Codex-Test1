const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{createHash}=require('crypto');
const root=path.resolve(__dirname,'../../..');
const packet=path.join(root,'private-artifacts/repo-mirror/reference-artifacts/analyses/combined-validation-oct12');
const hash=f=>createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const candidateHash='154d9621803bd1f176867b13764f752ce8b5ac321072d4cadbd2e2164acaf28a';
assert.equal(hash(path.join(packet,'candidate-build/index.html')),candidateHash);
const shotDir=path.join(root,'reference-artifacts/analyses/challenge-shot-witnesses');
const shots=fs.readdirSync(shotDir).filter(d=>d.startsWith('2026-10-12T16-09')).map(d=>{
 const file=path.join(shotDir,d,'report.json'),r=JSON.parse(fs.readFileSync(file));
 const variant=r.bundleHash===candidateHash?'candidate':'baseline';
 const raw=path.join(packet,variant+'-'+d+'.json');fs.copyFileSync(file,raw);
 const firstHitCounts={},witnesses=[];
 for(const t of r.result.trials){
  assert.equal(t.shots.length,1);assert.equal(t.shots[0].shots,1);assert.equal(t.shots[0].dual,false);
  assert.equal(t.player.vx,0);assert.equal(t.shots[0].shotXs.length,1);
  assert(Math.abs(t.player.x-t.shots[0].shotXs[0])<.02);assert(t.kills.length<=1);
  const k=t.kills[0];if(k)firstHitCounts[k.event.id]=(firstHitCounts[k.event.id]||0)+1;
  if(k?.event.id===372665405){assert.equal(k.target.pathFamily,'green-ladder-split');
   witnesses.push({launchTime:t.launchTime,killTime:k.event.t,shipX:t.player.x,vx:t.player.vx,id:k.event.id});}
 }
 return {variant,move:r.result.move,methodHash:r.methodHash,bundleHash:r.bundleHash,build:r.build,
  rawPath:raw,rawHash:hash(raw),trials:r.result.trials.length,targetHits:witnesses.length,
  otherFirstHits:Object.entries(firstHitCounts).filter(([id])=>+id!==372665405).reduce((s,[,n])=>s+n,0),
  misses:r.result.trials.filter(t=>!t.kills.length).length,firstHitCounts,
  shipXs:[...new Set(r.result.trials.map(t=>t.player.x))],witnesses,
  outcomes:r.result.trials.map(t=>({frame:t.launchFrame,x:t.player.x,id:t.kills[0]?.event.id||null,killT:t.kills[0]?.event.t||null}))};
});
assert.equal(shots.length,4);assert.equal(new Set(shots.map(r=>r.methodHash)).size,1);
const columnComparison=[];
for(const move of ['right30','right40']){
 const b=shots.find(r=>r.variant==='baseline'&&r.move===move),c=shots.find(r=>r.variant==='candidate'&&r.move===move);
 const pairs=c.outcomes.map(t=>({candidate:t,baseline:b.outcomes.find(u=>u.frame===t.frame)}));
 const sameX=pairs.filter(p=>Math.abs(p.candidate.x-p.baseline.x)<.02);
 for(const p of sameX){assert.equal(p.candidate.id,p.baseline.id);assert.equal(p.candidate.killT,p.baseline.killT);}
 if(move==='right40')assert.deepEqual(c.outcomes,b.outcomes);
 columnComparison.push({move,exactPositionMatchedTrials:sameX.length,total:pairs.length,
  differingOutcomePairs:pairs.filter(p=>p.candidate.id!==p.baseline.id)});
}
const entryFile=path.join(packet,'entry-cull-report.json'),entry=JSON.parse(fs.readFileSync(entryFile));
assert(entry.passed);
const summary={baseline:'cf0e7a666067ede385865ba02e73d1454eb132d1',generatedAt:new Date().toISOString(),
 verdict:'PASS bounded early-witness/full-entry/entry-cull/Stage3 controls; not overall gameplay acceptance.',
 candidateBundleHash:candidateHash,candidateEnemySourceHash:hash(path.join(packet,'tested-enemy-source.js')),
 baselineBundleHash:shots.find(r=>r.variant==='baseline').bundleHash,
 baselineEnemySourceHash:'1456799e1fadd17e9fc65ce387abd64811a67231ed1bdc866b914ac40f2d8815',
 shots,columnComparison,entryCull:{rawPath:entryFile,rawHash:hash(entryFile),methodHash:entry.methodHash,
  passed:entry.passed,results:entry.results.map(r=>({variant:r.variant,stage:r.stage,completed:r.completed,
   frames:r.frames,fullEntry:r.targets.filter(t=>t.fullFrames>0).length,
   missPhases:r.targets.reduce((o,t)=>{o[t.removal.phase]=(o[t.removal.phase]||0)+1;return o;},{}),
   upperRemovalIds:r.targets.filter(t=>t.removal.y<0).map(t=>t.id)}))},
 limits:['One seed9131/9103, controlled60Hz, independent one-shot restarts, not all-target perfect-route feasibility.',
  'right30 release timing varies actual X; exact matching is claimed only for common recorded positions, and all right40 trials.',
  'Full-entry uses harness sprite rectangle bounds, not rendered pixels; no audible/perceptual/whole-release acceptance.',
  'Stage31 baseline/candidate have16 middle-phase removals each; zero entry culls does not prove complete authored paths.',
  'No gameplay-source edits or rebuild; artifact identities, not current checkout source, identify tested code.']};
fs.writeFileSync(path.join(__dirname,'summary.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({verdict:summary.verdict,columnComparison,shots:shots.map(r=>({variant:r.variant,move:r.move,
 targetHits:r.targetHits,otherFirstHits:r.otherFirstHits,misses:r.misses,firstHitCounts:r.firstHitCounts})),entryCull:summary.entryCull},null,2));

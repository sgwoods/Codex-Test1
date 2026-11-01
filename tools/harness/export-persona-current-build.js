#!/usr/bin/env node
// Read-only verification of the completed Nov 1 panel; export no private payloads.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const read = file => JSON.parse(fs.readFileSync(file));
const digest = file => hash(fs.readFileSync(file));
const SOURCE = 'cb70121e9c5f29c483eec54f17b44e115a87c55f';
const POLICY = '737862f389315c0763c2c978fe55c955e7bc4413cc3f8515f2ccb92ec683c3a5';
const INPUT = 'e75da83616ce4e6eddb97a79e446f5e8b413d7fc4114bd1e3387ffca0884f3fe';
const SCENARIO = '5ad670d8bba5d0c9964a1bcb5b1a0f96e88852b950cfc132bd5b7f9565fa7c4f';
const MATRIX = [['expert','matched',91001],['expert','reserved',93001],
  ['novice','matched',91001],['advanced','matched',91001],['professional','matched',91001]];
const sha = value => { assert.match(value, /^[a-f0-9]{64}$/); return value; };
function stats(rows) {
  const scores = rows.map(r => r.score).sort((a,b) => a-b);
  assert.equal(scores.length,10);
  return {n:10,median:(scores[4]+scores[5])/2,min:scores[0],max:scores[9],
    reached75k:rows.filter(r=>r.score>=75000).length,timeLimits:rows.filter(r=>r.outcome==='time-limit').length,
    destroyedShips:rows.reduce((n,r)=>n+r.destroyedShips,0)};
}
function sanitize(results, provenance) {
  assert.equal(provenance.baseline,'b17c5d63');
  assert.equal(provenance.sourceCommit,SOURCE); assert.equal(provenance.policySha256,POLICY);
  assert.equal(String(provenance.build.buildNumber),'1257');
  assert.equal(provenance.build.commit,SOURCE);
  assert.equal(provenance.sourceInventory.sha256,INPUT);
  assert.equal(provenance.scenarioSha256,SCENARIO);
  assert.deepEqual(provenance.matrix,MATRIX);
  for(const arm of ['control','candidate']) {
    assert.equal(provenance.arms[arm].derived,true);
    assert.equal(provenance.arms[arm].originalBuildMetadataRetained,true);
  }
  assert.equal(results.rows.length,100,'Final 100-row panel required; no natural repeats');
  const rows = [], panels = {}, seen = new Set();
  for (const r of results.rows) {
    const group = MATRIX.find(([persona,panel])=>r.persona===persona && r.panel===panel);
    assert(group && ['control','candidate'].includes(r.arm),'Unexpected matrix member');
    assert(Number.isInteger(r.seed) && r.seed>=group[2] && r.seed<group[2]+10);
    const key = `${r.persona}/${r.panel}/${r.seed}/${r.arm}`;
    assert(!seen.has(key),'Duplicate matrix member'); seen.add(key);
    assert(['game-over','time-limit'].includes(r.outcome),'Unknown termination');
    const clean = {arm:r.arm,persona:r.persona,panel:r.panel,seed:r.seed,outcome:r.outcome};
    for (const field of ['score','stage','simT','activeLosses','capturedDestroyed','destroyedShips','captures','earlyLosses','interventions']) {
      assert(Number.isFinite(r[field]) && r[field]>=0,`Invalid ${field}`);
      if(field!=='simT')assert(Number.isInteger(r[field]),`Noninteger ${field}`);
      clean[field]=r[field];
    }
    assert.equal(r.destroyedShips,r.activeLosses+r.capturedDestroyed);
    assert.equal(typeof r.firstLoss.observed,'boolean');
    const field=r.firstLoss.observed?'time':'lowerBound', value=r.firstLoss[field];
    assert(Number.isFinite(value) && value>=0 && value<=r.simT);
    assert.equal(r.firstLoss.observed,r.activeLosses>0);
    if(!r.firstLoss.observed)assert.equal(value,r.simT);
    clean.firstLoss={observed:r.firstLoss.observed,[field]:value};
    for(const field of ['sessionSha256','traceSha256','receiptSha256','stdoutSha256'])clean[field]=sha(r[field]);
    rows.push(clean);
  }
  for(const [persona,panel] of MATRIX) {
    const a=rows.filter(r=>r.persona===persona && r.panel===panel && r.arm==='control');
    const b=rows.filter(r=>r.persona===persona && r.panel===panel && r.arm==='candidate');
    const control=stats(a),candidate=stats(b);
    const noNewEarly=b.every(r=>r.earlyLosses<=a.find(x=>x.seed===r.seed).earlyLosses);
    panels[`${persona}/${panel}`]={control,candidate,noNewEarly,pass:candidate.median>=control.median &&
      candidate.reached75k>=control.reached75k && candidate.destroyedShips<=control.destroyedShips && noNewEarly};
  }
  assert.deepEqual(results.panels,panels,'Reported gates disagree with observations');
  const passed=Object.values(panels).every(p=>p.pass);
  assert.equal(results.passed,passed);
  const indexHash=arm=>sha(provenance.arms[arm].inventory.files.find(f=>f.file==='index.html').sha256);
  return {schemaVersion:1,date:'2026-11-01',baseline:'b17c5d63',sourceCommit:SOURCE,buildNumber:1257,
    derived:true,originalBuildMetadataRetained:true,passed,panels,
    controlIndexSha256:indexHash('control'),candidateIndexSha256:indexHash('candidate'),policySha256:POLICY,
    scenarioSha256:sha(provenance.scenarioSha256),verifiedRows:100,unchangedOtherPersonaPairs:30,
    naturalRepeatObservations:0,
    limitations:['Derived private policy arms, not a released build or evidence of policy integration.',
      'Stage 1, three ships, Watch game scope, 900-second update budget; time-limit scores are censored lower bounds.',
      'Matched seeds 91001-91010 for four personas; reserved 93001-93010 for Expert only. No natural repeats counted.',
      'Current bot actuator contract; no human-feasibility or live Watch/Rival mode-parity claim.',
      '24 canonical audio files hash-checked; not an independent decode or audio-fidelity qualification.',
      'Runner receipts cover observed descendants, not physical process containment.'],rows};
}
function verifyArtifacts(results, p) {
  const loaded=new Map();
  const events=s=>s.events.filter(e=>e.type!=='audio_cue');
  const snapshots=s=>s.snapshots.map(x=>{const c=structuredClone(x);delete c.counts.effects;return c;});
  // Verify and release one pair at a time instead of retaining 100 full sessions.
  const ordered=MATRIX.flatMap(([persona,panel])=>results.rows.filter(r=>r.persona===persona && r.panel===panel)
    .sort((a,b)=>a.seed-b.seed || (a.arm==='control'?-1:1)));
  for(const r of ordered) {
    const receiptFile=path.join(r.run,'run.json'),stdoutFile=path.join(r.run,'stdout.log');
    const traceFile=path.join(path.dirname(r.file),'decision-trace.json');
    for(const [file,expected] of [[r.file,r.sessionSha256],[traceFile,r.traceSha256],
      [receiptFile,r.receiptSha256],[stdoutFile,r.stdoutSha256]])assert.equal(digest(file),expected,`Changed artifact: ${file}`);
    const receipt=read(receiptFile),summary=read(stdoutFile),session=read(r.file).session,trace=read(traceFile);
    assert(receipt.ok && receipt.inputsUnchanged && receipt.sourceBundleUnchanged && receipt.runnerMethodsUnchanged);
    assert.equal(receipt.exitCode,0);assert(!receipt.error && !receipt.signal);
    assert(['not-attempted','verified'].includes(receipt.cleanup?.status),'Incomplete cleanup');
    assert.equal(receipt.runnerMethods.sha256,p.runnerMethods.sha256);
    assert.equal(receipt.scenarioSha256,p.scenarioSha256);
    assert.equal(receipt.bundle.sha256,p.arms[r.arm].inventory.sha256);
    const s=summary.state,e=session.events;
    assert.equal(summary.duration,900);assert.equal(summary.seed,r.seed);assert.equal(s.persona,r.persona);
    assert(s.watchMode && s.watchScope==='game' && !s.playerTwo?.enabled);
    for(const key of ['score','stage','simT'])assert.equal(s[key],r[key]);
    assert(summary.files.includes(r.file));
    assert.equal(trace[0]?.kind,'observer-initialized');assert.equal(trace.length-1,r.interventions);
    assert(!e.some(x=>x.type==='system_issue' && x.action==='reference_audio_load_failed'));
    const over=e.findLast(x=>x.type==='game_over'),stop=e.findLast(x=>x.type==='harness_stop');
    if(over) {
      assert.equal(r.outcome,'game-over');assert(!s.started && s.lives===0);
      assert.equal(over.score,r.score);assert.equal(over.stage,r.stage);
    } else {
      assert.equal(r.outcome,'time-limit');assert(s.started && stop?.label==='aurora-persona-distribution');
    }
    const losses=e.filter(x=>x.type==='ship_lost');
    assert.equal(losses.length,r.activeLosses);
    assert.equal(e.filter(x=>x.type==='captured_fighter_destroyed').length,r.capturedDestroyed);
    assert.equal(e.filter(x=>x.type==='fighter_captured').length,r.captures);
    assert.equal(losses.filter(x=>x.stage<=2).length,r.earlyLosses);
    assert.deepEqual(r.firstLoss,losses.length?{observed:true,time:losses[0].t}:{observed:false,lowerBound:s.simT});
    loaded.set(r.arm,{r,session,trace:trace.slice(1)});
    if(r.arm==='control')continue;
    const a=loaded.get('control'),b=loaded.get('candidate');
    assert.equal(a.r.seed,b.r.seed);
    if(b.r.persona!=='expert' || !b.trace.length) {
      assert.deepEqual(events(a.session),events(b.session));assert.deepEqual(snapshots(a.session),snapshots(b.session));
    } else {
      const cutoff=Math.floor(b.trace[0].t*1000)/1000;
      assert.deepEqual(events(a.session).filter(e=>e.t<cutoff),events(b.session).filter(e=>e.t<cutoff));
    }
    if(b.r.persona==='expert' && b.r.seed===91001) {
      const time=r=>r.firstLoss.observed?r.firstLoss.time:r.firstLoss.lowerBound;
      assert(b.trace.length && time(b.r)>146.9 && time(b.r)>=time(a.r));
      assert(b.r.score>=46960 && b.r.stage>=8 && b.r.score>=a.r.score && b.r.stage>=a.r.stage);
    }
    loaded.clear();
  }
  assert.equal(loaded.size,0);
  assert.equal(p.audio.length,24);
  assert.equal(new Set(p.audio.map(a=>a.file)).size,24);
  for(const audio of p.audio)assert.equal(digest(path.join(p.sourceBundle,audio.file)),audio.sha256);
}
function convert(resultsFile) {
  const provenanceFile=path.join(path.dirname(resultsFile),'provenance.json');
  const results=read(resultsFile),p=read(provenanceFile);
  assert.equal(digest(provenanceFile),results.provenanceSha256);
  const output=sanitize(results,p);
  for(const item of [...p.methods,...p.references]) {
    assert(!path.isAbsolute(item.file) && !item.file.split(/[\\/]/).includes('..'));
    assert.equal(digest(path.join(path.dirname(resultsFile),item.file)),item.sha256);
  }
  assert.equal(digest(path.join(path.dirname(resultsFile),'policy.js')),POLICY);
  assert.equal(digest(path.join(path.dirname(resultsFile),'scenario.json')),SCENARIO);
  verifyArtifacts(results,p);
  // Hash-only dependency attestations deliberately omit local paths and build auth metadata.
  const d=p.runnerDependencies;
  output.provenance={rawResultsSha256:digest(resultsFile),privateProvenanceSha256:results.provenanceSha256,
    converterSha256:digest(__filename),sourceInventorySha256:sha(p.sourceInventory.sha256),
    runnerMethodsSha256:sha(p.runnerMethods.sha256),nodeSha256:sha(d.node.sha256),
    playwrightInventorySha256:sha(d.playwright.inventory.sha256),browserSha256:sha(d.browser.sha256),
    packageSha256:d.packageFiles.map(f=>sha(f.sha256)),methodSha256:p.methods.map(f=>sha(f.sha256)),
    historicalMethodSha256:p.references.map(f=>sha(f.sha256)),audioSha256:p.audio.map(f=>sha(f.sha256)),
    audioManifestSha256:sha(p.audioManifest.sha256)};
  return output;
}
if(require.main===module) {
  try {
    const args=process.argv.slice(2);
    assert(args.length===4 && args[0]==='--results' && args[2]==='--out',
      'Usage: node export-persona-current-build.js --results /absolute/final/results.json --out /absolute/new/current-build.json');
    const output=convert(path.resolve(args[1])),dest=path.resolve(args[3]);
    fs.mkdirSync(path.dirname(dest),{recursive:true});
    fs.writeFileSync(dest,JSON.stringify(output,null,2)+'\n',{flag:'wx'});
    console.log(`Verified and exported 100 observations; frozen gate ${output.passed?'passed':'FAILED'}; no natural repeats.`);
  } catch(error) { console.error(error.message);process.exitCode=1; }
}
module.exports={sanitize,stats,convert,verifyArtifacts,MATRIX,SOURCE,POLICY,INPUT,SCENARIO};

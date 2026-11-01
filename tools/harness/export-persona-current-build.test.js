const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const crypto=require('node:crypto');
const {sanitize,stats,verifyArtifacts,MATRIX,SOURCE,POLICY,INPUT,SCENARIO}=require('./export-persona-current-build');
const HASH='a'.repeat(64);
function fixture() {
  const rows=MATRIX.flatMap(([persona,panel,start])=>Array.from({length:10},(_,i)=>
    ['control','candidate'].map(arm=>({persona,panel,seed:start+i,arm,outcome:'time-limit',score:100000,
      stage:20,simT:899.5,activeLosses:0,capturedDestroyed:0,destroyedShips:0,captures:0,
      earlyLosses:0,firstLoss:{observed:false,lowerBound:899.5},interventions:0,
      sessionSha256:HASH,traceSha256:HASH,receiptSha256:HASH,stdoutSha256:HASH,
      run:'/PRIVATE/do-not-export',file:'/PRIVATE/session',privatePayload:{secret:'DO-NOT-EXPORT'}})))).flat();
  const panels=Object.fromEntries(MATRIX.map(([persona,panel])=>[`${persona}/${panel}`,{
    control:stats(rows.filter(r=>r.persona===persona && r.panel===panel && r.arm==='control')),
    candidate:stats(rows.filter(r=>r.persona===persona && r.panel===panel && r.arm==='candidate')),
    noNewEarly:true,pass:true}]));
  const arm={derived:true,originalBuildMetadataRetained:true,inventory:{files:[{file:'index.html',sha256:HASH}]}};
  return {results:{passed:true,panels,rows},provenance:{baseline:'b17c5d63',sourceCommit:SOURCE,
    policySha256:POLICY,build:{buildNumber:1257,commit:SOURCE,auth:{email:'PRIVATE@invalid'}},scenarioSha256:SCENARIO,
    sourceInventory:{sha256:INPUT},matrix:structuredClone(MATRIX),
    arms:{control:arm,candidate:arm}}};
}
test('exports exact 100-row matrix with censor bounds, never private fields',()=>{
  const f=fixture(),out=sanitize(f.results,f.provenance);
  assert.equal(out.rows.length,100);assert.equal(out.naturalRepeatObservations,0);
  assert.equal(out.panels['professional/matched'].candidate.timeLimits,10);
  assert.deepEqual(out.rows[0].firstLoss,{observed:false,lowerBound:899.5});
  assert(!/PRIVATE|DO-NOT-EXPORT|privatePayload|auth/.test(JSON.stringify(out)));
});
for(const [name,mutate] of [
  ['incomplete panel',f=>f.results.rows.pop()],
  ['natural repeat appended',f=>f.results.rows.push({...f.results.rows[0]})],
  ['duplicate replacing missing seed',f=>f.results.rows[2]={...f.results.rows[0]}],
  ['reserved non-Expert',f=>f.results.rows[20].persona='professional'],
  ['unreserved seed',f=>f.results.rows[0].seed=91011],
  ['unknown outcome',f=>f.results.rows[0].outcome='unknown'],
  ['nonfinite score',f=>f.results.rows[0].score=NaN],
  ['censored zero substituted for bound',f=>f.results.rows[0].firstLoss.lowerBound=0],
  ['loss count inconsistent',f=>f.results.rows[0].activeLosses=1],
  ['wrong baseline',f=>f.provenance.baseline='other'],
  ['wrong policy',f=>f.provenance.policySha256='b'.repeat(64)],
  ['wrong build',f=>f.provenance.build.buildNumber=1256],
  ['wrong scenario',f=>f.provenance.scenarioSha256=HASH],
  ['unmarked derived arm',f=>f.provenance.arms.candidate.derived=false],
  ['wrong gate aggregate',f=>f.results.panels['expert/matched'].candidate.median=1],
  ['wrong overall pass',f=>f.results.passed=false],
  ['malformed artifact hash',f=>f.results.rows[0].sessionSha256='/PRIVATE/file']
])test(`rejects ${name}`,()=>{const f=fixture();mutate(f);assert.throws(()=>sanitize(f.results,f.provenance));});
test('failed frozen gate remains failed, not discarded or promoted',()=>{
  const f=fixture(),r=f.results.rows.find(r=>r.persona==='expert' && r.arm==='candidate');
  r.score=1;
  const gate=f.results.panels['expert/matched'];gate.candidate.min=1;gate.candidate.reached75k=9;gate.pass=false;
  f.results.passed=false;
  assert.equal(sanitize(f.results,f.provenance).passed,false);
});
function artifactFixture(t) {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'persona-export-test-'));
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const digest=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const write=(file,data)=>{fs.writeFileSync(file,JSON.stringify(data));return digest(file);};
  const p={sourceBundle:dir,scenarioSha256:SCENARIO,runnerMethods:{sha256:HASH},
    arms:{control:{inventory:{sha256:HASH}},candidate:{inventory:{sha256:HASH}}},audio:[]};
  for(let i=0;i<24;i++) {
    const file=`audio-${i}.fixture`;p.audio.push({file,sha256:write(path.join(dir,file),i)});
  }
  const rows=['control','candidate'].map(arm=>{
    const run=path.join(dir,arm);fs.mkdirSync(run);
    const file=path.join(run,'session.json'),events=[{type:'ship_lost',t:10,stage:3},
      {type:'game_over',score:100,stage:3}];
    const sessionSha256=write(file,{session:{events,snapshots:[{counts:{effects:arm==='control'?1:2}}]}});
    const traceSha256=write(path.join(run,'decision-trace.json'),[{kind:'observer-initialized'}]);
    const receiptSha256=write(path.join(run,'run.json'),{ok:true,inputsUnchanged:true,sourceBundleUnchanged:true,
      runnerMethodsUnchanged:true,exitCode:0,cleanup:{status:'not-attempted'},runnerMethods:{sha256:HASH},
      scenarioSha256:SCENARIO,bundle:{sha256:HASH}});
    const stdoutSha256=write(path.join(run,'stdout.log'),{duration:900,seed:91001,files:[file],state:{
      persona:'novice',watchMode:true,watchScope:'game',score:100,stage:3,simT:20,started:false,lives:0}});
    return {arm,persona:'novice',panel:'matched',seed:91001,outcome:'game-over',score:100,stage:3,simT:20,
      activeLosses:1,capturedDestroyed:0,captures:0,earlyLosses:0,firstLoss:{observed:true,time:10},
      interventions:0,run,file,sessionSha256,traceSha256,receiptSha256,stdoutSha256};
  });
  return {results:{rows},p,write,digest};
}
test('verifies hashed paired artifacts while ignoring only visual effects',t=>{
  const f=artifactFixture(t);verifyArtifacts(f.results,f.p);
});
test('rejects mutated session bytes before interpreting them',t=>{
  const f=artifactFixture(t);fs.appendFileSync(f.results.rows[0].file,' ');
  assert.throws(()=>verifyArtifacts(f.results,f.p),/Changed artifact/);
});
test('rejects incomplete cleanup even with updated receipt hash',t=>{
  const f=artifactFixture(t),r=f.results.rows[0],file=path.join(r.run,'run.json');
  const receipt=JSON.parse(fs.readFileSync(file));receipt.cleanup.status='incomplete';
  r.receiptSha256=f.write(file,receipt);
  assert.throws(()=>verifyArtifacts(f.results,f.p),/Incomplete cleanup/);
});
test('rejects terminal state relabeled as censored',t=>{
  const f=artifactFixture(t);f.results.rows[0].outcome='time-limit';
  assert.throws(()=>verifyArtifacts(f.results,f.p));
});
test('rejects mechanical event divergence even with updated session hash',t=>{
  const f=artifactFixture(t),r=f.results.rows[1],data=JSON.parse(fs.readFileSync(r.file));
  data.session.events.push({type:'player_moved',x:1});r.sessionSha256=f.write(r.file,data);
  assert.throws(()=>verifyArtifacts(f.results,f.p));
});

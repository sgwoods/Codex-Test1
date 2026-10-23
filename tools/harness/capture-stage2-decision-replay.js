#!/usr/bin/env node
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
process.chdir(root);
const dir=path.resolve(process.argv[2]||'private-artifacts/stage2-decision-replay-oct20');
const retained=process.argv[3]==='--retained-low-tail';
const freshLoss=process.argv[3]==='--stage2-retained-loss';
if(process.argv[3]&&!retained&&!freshLoss)throw Error('Unknown capture profile');
const stage=retained?13:2,start=retained?329.3:freshLoss?11.9:8.3,end=retained?329.7:freshLoss?12.5:8.9;
const seed=retained?89003:freshLoss?93008:51301;
const scenario=retained?'private-artifacts/persona-distribution-oct18/aurora.json':'tools/harness/scenarios/stage2-opening.json';
if(fs.existsSync(dir))throw Error('Refusing to overwrite replay packet');
fs.mkdirSync(dir,{recursive:true});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const original=fs.readFileSync('dist/dev/index.html','utf8');
const marker='function harnessTargetScore(state,e,p,cfg){';
if(original.split(marker).length!==2)throw Error('Unexpected controller layout');
// Reconstruct the rejected deadband-only policy in private copies, never localhost.
const trial=retained||freshLoss?original:original.replace(marker,`const replayOriginalConfig=harnessPersonaCfg;
harnessPersonaCfg=function(state){const cfg=replayOriginalConfig(state);return cfg?.name==='professional'&&state.stage===2&&!state.challenge?Object.assign({},cfg,{deadZone:7}):cfg;};
${marker}`);
const point='const axis=harnessResolveHazardAxis(S,p,cfg,preferredAxis,dt);';
if(trial.split(point).length!==2)throw Error('Unexpected decision layout');
let instrumented=trial.replace(point,point+`
 if(S.stage===${stage}&&S.simT>=${start}&&S.simT<=${end}){
  (window.__auroraDecisionTrace||(window.__auroraDecisionTrace=[])).push(JSON.parse(JSON.stringify({
   kind:'decision',t:S.simT,dt,preferredAxis,axis,cfg,p,
   state:{stage:S.stage,challenge:S.challenge,e:S.e,eb:S.eb,pb:S.pb},
   playerBox:playerHitbox(),enemyBoxes:S.e.map(e=>({id:e.id,box:enemyCollisionHitbox(e)}))
  })));
 }
`);
const collision='function updateEnemyBodyCollisions(state,p){';
if(instrumented.split(collision).length!==2)throw Error('Unexpected collision layout');
instrumented=instrumented.replace(collision,collision+`
 if(state.stage===${stage}&&state.simT>=${start}&&state.simT<=${end}){
  (window.__auroraDecisionTrace||(window.__auroraDecisionTrace=[])).push(JSON.parse(JSON.stringify({
   kind:'body-collision',t:state.simT,p,
   state:{stage:state.stage,challenge:state.challenge,e:state.e,eb:state.eb,pb:state.pb},
   playerBox:playerHitbox(),enemyBoxes:state.e.map(e=>({id:e.id,box:enemyCollisionHitbox(e)}))
  })));
 }
`);
const bullet='function updateEnemyBullets(state,dt,p){';
if(instrumented.split(bullet).length!==2)throw Error('Unexpected bullet layout');
instrumented=instrumented.replace(bullet,bullet+`
 if(state.stage===${stage}&&state.simT>=${start}&&state.simT<=${end}){
  (window.__auroraDecisionTrace||(window.__auroraDecisionTrace=[])).push(JSON.parse(JSON.stringify({
   kind:'pre-bullet',t:state.simT,dt,p,
   state:{stage:state.stage,challenge:state.challenge,e:state.e,eb:state.eb,pb:state.pb},
   playerBox:playerHitbox(),enemyBoxes:state.e.map(e=>({id:e.id,box:enemyCollisionHitbox(e)}))
  })));
 }
`);
const receipt={baseline:spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim(),
  originalBuildHash:hash(original),trialBuildHash:hash(trial),instrumentedBuildHash:hash(instrumented),
  controllerHash:hash(fs.readFileSync('src/js/05-player-flow.js')),methodHash:hash(fs.readFileSync(__filename)),
  scenarioHash:hash(fs.readFileSync(scenario)),
  seed,profile:retained?'retained-low-tail':freshLoss?'stage2-retained-loss':'rejected-stage2',
  change:retained?'No policy change; retained Stage13 encounter':freshLoss?'No policy change; retained Stage2 fresh-seed collision':'Rejected Stage2 Professional deadZone7 reconstruction only',runs:{}};
fs.writeFileSync(path.join(dir,'controller.js'),fs.readFileSync('src/js/05-player-flow.js'));
fs.writeFileSync(path.join(dir,'combat.js'),fs.readFileSync('src/js/05-player-combat.js'));
fs.writeFileSync(path.join(dir,'boot.js'),fs.readFileSync('src/js/00-boot.js'));
for(const [name,html] of [['control',trial],['capture',instrumented]]){
  const input=path.join(dir,name,'input');fs.cpSync('dist/dev',input,{recursive:true});
  fs.writeFileSync(path.join(input,'index.html'),html);
  const args=['tools/harness/run-gameplay.js','--root',input,'--scenario',scenario,'--persona','professional','--seed',String(seed),'--auto-video','0','--out',path.join(dir,name,'runs')];
  if(name==='capture')args.push('--decision-trace');
  const r=spawnSync(process.execPath,args,{encoding:'utf8',timeout:120000,maxBuffer:30*1024*1024});
  fs.writeFileSync(path.join(dir,name,'run.log'),r.stdout+'\n'+r.stderr);
  if(r.status!==0)throw Error(`${name} failed: ${r.stderr}`);
  const result=JSON.parse(r.stdout);receipt.runs[name]={state:result.state,files:result.files};
}
fs.writeFileSync(path.join(dir,'receipt.json'),JSON.stringify(receipt,null,2));
console.log(JSON.stringify({packet:dir,runs:receipt.runs},null,2));

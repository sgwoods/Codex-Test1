#!/usr/bin/env node
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {ROOT}=require('../build/paths');
const {launchHarnessBrowser}=require('./browser-launch');
const URL='https://sgwoods.github.io/Aurora-Galactica/dev/';
const EXPECTED='7b16af661867c1391b6dbcb42bd85c4610dcf3b2';
const OFFSETS=[0,3.593,7.137,9.997,13.79];

async function run(browser,persona){
 const context=await browser.newContext({viewport:{width:1440,height:1600}});
 try{
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(String(error)));
  await page.addInitScript(()=>{
   for(const prefix of ['platinum','auroraGalactica']){
    localStorage.setItem(prefix+'AutoVideo','0');
    localStorage.setItem(prefix+'HarnessSeed','9131');
   }
  });
  const response=await page.goto(URL,{waitUntil:'networkidle'});
  const bundleHash=createHash('sha256').update(await response.body()).digest('hex');
  const build=await page.evaluate(async()=>await(await fetch('build-info.json',{cache:'no-store'})).json());
  assert.equal(build.commit,EXPECTED);
  assert.equal(build.releaseChannel,'development');
  assert.equal(build.dirty,false);
  await page.locator('#settingsBtn').click();
  await page.locator('#testStartKind').selectOption('challenge');
  await page.locator('#testChallengeStage').fill('8');
  await page.locator('#testExpertPlays').selectOption(persona);
  await page.locator('#testShips').fill('3');
  await page.locator('#settingsPanelClose').click();
  await page.locator('#c').focus();
  await page.keyboard.press('Enter');
  const result=await page.evaluate(async()=>{
   const h=window.__galagaHarness__;
   if(!h)throw new Error('Hosted development diagnostics unavailable');
   const initial=h.snapshot(),initialState=h.state(),formation=h.challengeFormationState();
   const targets=new Map(formation.enemies.map(e=>[e.id,{id:e.id,wave:e.wave,lane:e.lane,
    bounds:h.challengeSpriteBounds(e.id),firstVisible:null,fullyEntered:false}]));
   const overlapSeconds=[0,0,0,0,0,0],captures=[];
   const wallStart=performance.now();
   let prior=initial.simT,firstArrival=null,idle=0,idleRun=0,maxIdle=0;
   let maxEnemyBullets=0,maxAttackers=0,minLives=initial.lives,nextCapture=2;
   await new Promise((resolve,reject)=>{
    function sample(){
     try{
      const snap=h.snapshot(),current=h.challengeFormationState();
      const dt=Math.max(0,snap.simT-prior);prior=snap.simT;
      if(snap.stage===31&&snap.challenge){
       const visibleWaves=new Set();
       maxEnemyBullets=Math.max(maxEnemyBullets,snap.counts.enemyBullets);
       maxAttackers=Math.max(maxAttackers,snap.counts.attackers);
       minLives=Math.min(minLives,snap.lives);
       for(const e of current.enemies){
        if(e.spawn>0&&!e.referenceLeadIn)continue;
        const target=targets.get(e.id);
        if(!target)throw new Error('Unexpected target identity');
        const b=target.bounds,x=Math.round(e.x),y=Math.round(e.y);
        if(x+b.right>0&&x+b.left<280&&y+b.bottom>0&&y+b.top<360){
         visibleWaves.add(e.wave);
         if(target.firstVisible===null)target.firstVisible=snap.simT;
         if(firstArrival===null)firstArrival=snap.simT;
        }
        if(x+b.left>=0&&x+b.right<=280&&y+b.top>=0&&y+b.bottom<=360)target.fullyEntered=true;
       }
       if(current.enemies.length){
        overlapSeconds[visibleWaves.size]+=dt;
        if(firstArrival!==null&&!visibleWaves.size){idle+=dt;idleRun+=dt;maxIdle=Math.max(maxIdle,idleRun);}
        else idleRun=0;
       }
       if(snap.simT>=nextCapture&&captures.length<12){
        captures.push({simT:snap.simT,visibleWaves:visibleWaves.size,png:document.getElementById('c').toDataURL('image/png')});
        nextCapture+=2;
       }
      }
      const spawn=h.sessionEvents(20000).find(e=>e.type==='challenge_transition_spawn_commit'&&e.stage===31);
      if(spawn){resolve();return;}
      if(performance.now()-wallStart>45000)throw new Error('Hosted Stage31 did not complete within45s');
      requestAnimationFrame(sample);
     }catch(error){reject(error);}
    }
    sample();
   });
   const events=h.sessionEvents(20000);
   const clear=events.find(e=>e.type==='challenge_clear'&&e.stage===31);
   const spawn=events.find(e=>e.type==='challenge_transition_spawn_commit'&&e.stage===31);
   return {initial,initialState,final:h.snapshot(),layout:formation.layout,targets:[...targets.values()],
    overlapSeconds,captures,clear,spawn,events,audioHistory:h.audioHistory(200),
    wallSeconds:(performance.now()-wallStart)/1000,idleSeconds:idle,maxIdleSeconds:maxIdle,
    maximumEnemyBullets:maxEnemyBullets,maximumAttackers:maxAttackers,minLives};
  });
  return {persona,build,bundleHash,pageErrors:errors,...result};
 }finally{await context.close();}
}

async function main(){
 const out=path.join(ROOT,'reference-artifacts/analyses/hosted-stage31-review',
  `${new Date().toISOString().replace(/[:.]/g,'-')}-7b16af66`);
 fs.mkdirSync(out,{recursive:true});
 const browser=await launchHarnessBrowser();
 let runs;
 try{runs=[await run(browser,'human'),await run(browser,'professional')];}
 finally{await browser.close();}
 for(const r of runs)for(const [i,c] of r.captures.entries()){
  c.file=`${r.persona}-${i}.png`;
  fs.writeFileSync(path.join(out,c.file),Buffer.from(c.png.split(',')[1],'base64'));
  delete c.png;
  c.sha256=createHash('sha256').update(fs.readFileSync(path.join(out,c.file))).digest('hex');
 }
 const checks={identity:runs.every(r=>r.initial.stage===31&&r.initialState.seed===9131),
  persona:runs.every(r=>r.persona==='human'?!r.initial.watchMode:r.initial.watchMode&&r.initial.watchPersona==='professional'),
  schedule:runs.every(r=>JSON.stringify(r.layout.groupSpawnOffsets)===JSON.stringify(OFFSETS)),
  entry:runs[0].targets.length===40&&runs[0].targets.every(t=>t.fullyEntered),
  safety:runs.every(r=>r.maximumEnemyBullets===0&&r.maximumAttackers===0&&r.minLives===r.initial.lives&&
   !r.events.some(e=>e.stage===31&&['enemy_attack_start','ship_lost'].includes(e.type))),
  cadence:runs.every(r=>r.clear&&r.spawn&&Math.abs(r.spawn.t-r.clear.t-4.433)<.1),
  browser:runs.every(r=>r.pageErrors.length===0),
  publicAudio:runs.every(r=>!JSON.stringify(r.audioHistory).includes('assets/reference-audio/')),
  resultCue:runs.every(r=>r.audioHistory.some(e=>e.stage===31&&e.cue==='challengeResults'))};
 const observations=runs.map(r=>({persona:r.persona,
  nonlethalContacts:r.events.filter(e=>e.stage===31&&e.type==='challenge_enemy_contact').length,
  maxIdleSeconds:r.maxIdleSeconds,hits:r.clear?.hits,total:r.clear?.total}));
 const report={ok:Object.values(checks).every(Boolean),generatedAt:new Date().toISOString(),
  url:URL,expectedCommit:EXPECTED,methodHash:createHash('sha256').update(fs.readFileSync(__filename)).digest('hex'),
  method:'Hosted Settings UI launch, normal browser clock, requestAnimationFrame state sampling; no layout or timing overrides.',
  checks,observations,runs,limitations:['One Professional seed; not human-play acceptance or perfect-route feasibility.',
   'Visibility and overlap are sampled at browser frame cadence, not exact fixed60Hz.',
   'No-fire full entry only; destroyed targets censor Professional visibility.',
   'Audio history is not audible or canonical private-phrase verification.',
   'Idle excludes initial arrival, results and handoff; trailing offscreen exit time is included.']};
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({out,ok:report.ok,checks,runs:runs.map(r=>({persona:r.persona,
  hits:r.clear?.hits,total:r.clear?.total,clear:r.clear?.t,cadence:r.spawn.t-r.clear.t,
  idle:r.idleSeconds,maxIdle:r.maxIdleSeconds,overlap:r.overlapSeconds,
  entered:r.targets.filter(t=>t.fullyEntered).length,wallSeconds:r.wallSeconds}))},null,2));
 if(!report.ok)process.exitCode=1;
}
main().catch(error=>{console.error(error);process.exitCode=1;});

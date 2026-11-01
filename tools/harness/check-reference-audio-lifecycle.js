#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {withHarnessPage}=require('./browser-check-util');
const {inventory,digest,sourceIdentity}=require('../testing/run-evidence');
const {createFrozenOutput}=require('./frozen-output');
const [bundle,output]=process.argv.slice(2);
assert(bundle&&output,'Usage: node check-reference-audio-lifecycle.js FROZEN_BUNDLE NEW_OUTPUT');
const {root,out}=createFrozenOutput(bundle,output);
const before=inventory(root),report={source:sourceIdentity(),bundleHash:before.sha256,methodHash:digest(fs.readFileSync(__filename)),
  helperHash:digest(fs.readFileSync(require.resolve('./browser-check-util'))),
  outputGuardHash:digest(fs.readFileSync(require.resolve('./frozen-output'))),
  limitation:'Browser audio-node lifecycle with real decoded assets, not acoustic fidelity or full final-loss recording.'};
(async()=>{
 try{
  await withHarnessPage({root,offline:true,skipStart:true},async({page,browser})=>{
   report.browser=browser.version();
   report.result=await page.evaluate(async()=>{
    const sfx=window.__qualityAudio;
    if(!sfx)throw new Error('Requires explicitly instrumented private audio fixture');
    const h=window.__galagaHarness__,clip='assets/reference-audio/galaga-last-ship-destroyed-ambience.m4a';
    const other='assets/reference-audio/galaga3-captured-fighter-destroyed.m4a';
    const ending=await sfx.loadReferenceBuffer(clip);await sfx.loadReferenceBuffer(other);
    if(!ending)throw new Error('Missing decoded ending');
    const ref=window.__platinumAudioDebug.reference;
    const later=()=>new Promise(resolve=>setTimeout(resolve,0));
    sfx.playReferenceClip(clip,{allowIdle:true,force:true,cueEntry:{cue:'gameOver'},clipStart:2.3,clipDuration:4.2});
    await later();
    const active=sfx.referenceActive.find(s=>s.__clip===clip);
    const cached={lastRequested:ref.lastRequested,lastLoaded:ref.lastLoaded,lastStarted:ref.lastStarted,
      bufferMatches:active?.buffer===ending,offset:active?.__clipStart,duration:active?.__clipDuration};
    sfx.stopReferenceClips();await later();
    const load=sfx.loadReferenceBuffer;
    let release,intercepted=false,settled=false;
    sfx.loadReferenceBuffer=function(requested){
     if(requested!==clip||intercepted)return load.call(this,requested);
     intercepted=true;
     return new Promise(resolve=>{release=value=>{settled=true;resolve(value);};});
    };
    const count=ref.startedHistory.length;
    sfx.playReferenceClip(clip,{allowIdle:true,force:true,cueEntry:{cue:'gameOver'},clipStart:2.3,clipDuration:4.2});
    h.start({autoVideo:false,controlledClock:true,persona:'',seed:91001,stage:1,ships:3});
    // Restore loading before resolving the intentionally delayed old-session request.
    sfx.loadReferenceBuffer=load;
    if(!intercepted||!release)throw new Error('Target ending request was not intercepted');
    release(ending);await later();
    if(!settled)throw new Error('Target ending request did not settle');
    const after=ref.startedHistory.slice(count).filter(s=>s.clip===clip);
    sfx.stopReferenceClips();
    return {cached,restartedEndingStarts:after,pending:sfx.referencePending?.size??null};
   });
   const r=report.result;
   assert(r.cached.bufferMatches);
   assert.notEqual(r.cached.lastLoaded,r.cached.lastStarted,'Fixture must exercise differing last-loaded metadata');
   assert.equal(r.cached.offset,2.3);assert.equal(r.cached.duration,4.2);
   assert.deepEqual(r.restartedEndingStarts,[],'Old ending started after restart');
   assert.equal(r.pending,0);
  });
  assert.equal(inventory(root).sha256,before.sha256);report.passed=true;
 }catch(error){report.error=String(error.stack||error);process.exitCode=1;}
 fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify(report,null,2));
})();

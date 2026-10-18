#!/usr/bin/env node
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto');
const {launchHarnessBrowser}=require('./browser-launch');
const root=path.resolve(process.argv[2]);
const out=path.resolve(process.argv[3]);
function fixture(){
 const user={id:'fixture-pilot',email:'fixture@example.invalid',email_confirmed_at:'2026-01-01',user_metadata:{display_initials:'TST'}};
 let current={user};
 function from(table){
  const ops=[];const q=new Proxy({}, {get(_,name){
   if(name==='then')return (resolve,reject)=>window.scoreBoundary({table,ops}).then(resolve,reject);
   if(name==='maybeSingle')return ()=>window.scoreBoundary({table,ops,single:true});
   if(['select','eq','neq','not','order','limit'].includes(name))return (...args)=>{ops.push([name,...args]);return q;};
   throw Error('Unexpected query '+table+'.'+String(name));
  }});return q;
 }
 const client={from,rpc:(name,args)=>window.scoreBoundary({rpc:name,args}),auth:{
  onAuthStateChange(callback){window.fixtureAuth=(signed)=>{current=signed?{user}:null;callback(signed?'SIGNED_IN':'SIGNED_OUT',current);};return {data:{subscription:{unsubscribe(){}}}};},
  async getSession(){return {data:{session:current}};}
 }};
 Object.defineProperty(window,'supabase',{get:()=>({createClient:()=>client}),set(){}});
}
(async()=>{
 const info=JSON.parse(fs.readFileSync(path.join(root,'build-info.json')));
 assert.equal(info.releaseChannel,'production beta');
 fs.mkdirSync(out,{recursive:true});
 const rows={scores:[],game_scores:[]},calls=[],errors=[];
 const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');const f=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname)));
  if(!f.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(f,(e,b)=>{if(e){res.writeHead(404).end();return;}res.setHeader('content-type',path.extname(f)==='.html'?'text/html':path.extname(f)==='.js'?'application/javascript':'application/octet-stream');res.end(b);});
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin=`http://localhost:${server.address().port}`;
 let browser;
 try{
  browser=await launchHarnessBrowser();
  async function open(){
   const context=await browser.newContext({serviceWorkers:'block'});
   await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
   await context.routeWebSocket('**/*',s=>s.close());
   await context.exposeBinding('scoreBoundary',async(_,request)=>{
    calls.push(request);
    if(request.rpc){
     assert.equal(request.rpc,'submit_platform_score');
     assert.deepEqual(Object.keys(request.args).sort(),['p_build','p_game_key','p_initials','p_score','p_stage']);
     const p=request.args;assert(['aurora-galactica','galaxy-guardians-preview'].includes(p.p_game_key));
     const table=p.p_game_key==='aurora-galactica'?'scores':'game_scores';
     rows[table].push({id:table+'-1',user_id:'fixture-pilot',initials:p.p_initials,score:p.p_score,stage:p.p_stage,build:p.p_build,game_key:p.p_game_key,game_title:p.p_game_key,is_verified:false,achieved_at:'2026-10-18'});
     return {data:table+'-1',error:null};
    }
    if(request.table==='profiles')return {data:{user_id:'fixture-pilot',display_initials:'TST'},error:null};
    assert(['scores','game_scores'].includes(request.table));
    let data=rows[request.table].slice();
    for(const [op,key,value] of request.ops){if(op==='eq')data=data.filter(row=>row[key]===value);}
    assert(request.ops.some(op=>op[0]==='eq'&&op[1]==='game_key'),'Query must scope game before top10');
    data.sort((a,b)=>b.score-a.score||b.stage-a.stage);
    return {data:data.slice(0,10),error:null};
   });
   await context.addInitScript(fixture);
   const page=await context.newPage();page.on('pageerror',e=>errors.push(String(e)));
   await page.goto(origin,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>typeof LEADERBOARD!=='undefined'&&LEADERBOARD.user?.id==='fixture-pilot');
   return {page,context};
  }
  const first=await open();
  for(const [game,score] of [['aurora-galactica',12345],['galaxy-guardians-preview',54321]]){
   const result=await first.page.evaluate(async({game,score})=>{
    installGamePack(game,{persist:0});
    const saved=await submitScoreRemote({gameKey:game,initials:'TST',score,stage:2});
    await refreshLeaderboard('mine',{force:1});
    return {saved};
   },{game,score});assert.equal(result.saved,1);
  }
  assert.equal(calls.filter(c=>c.rpc).length,2);
  await first.context.close();
  const second=await open();
  for(const [game,score] of [['aurora-galactica',12345],['galaxy-guardians-preview',54321]]){
   const result=await second.page.evaluate(async game=>{
    installGamePack(game,{persist:0});await refreshLeaderboard('mine',{force:1});
    return leaderboardRowsForView('mine').map(r=>({score:r.score,game:r.gameKey,verified:r.verified}));
   },game);
   assert.deepEqual(result,[{score,game,verified:false}]);
  }
  await second.page.evaluate(()=>window.fixtureAuth(false));
  const guest=await second.page.evaluate(()=>submitScoreRemote({gameKey:'aurora-galactica',initials:'TST',score:1,stage:1}));
  assert.equal(guest,0);assert.equal(calls.filter(c=>c.rpc).length,2);
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({ok:true,build:info.label,source:info.commit,indexSha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'index.html'))).digest('hex'),calls,errors,limitations:'Exact compiled public package; fake provider shared across fresh browser contexts. No real credentials, scores or live backend requests. Direct submit function invocation, not natural gameplay completion.'},null,2));
  console.log('PASS exact beta: both games RPC save and second browser-context retrieval; guests blocked; no direct inserts or page errors.');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});

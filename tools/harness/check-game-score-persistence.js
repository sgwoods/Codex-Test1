#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = name => fs.readFileSync(path.join(__dirname, '../../src/js', name), 'utf8');
const A = 'aurora-galactica', G = 'galaxy-guardians-preview';
const database = { scores: [], game_scores: [] };
const storage = new Map();
const publicMode = process.argv.includes('--public');
function publicSource(text){
 const outputs=['build-index.js','promote-beta.js'].map(file=>{
  const build=fs.readFileSync(path.join(__dirname,'../build',file),'utf8');
  const start=build.indexOf('function stripPublicClientScoreWriteSurface(');
  const end=build.indexOf('function stripPublicAccountReviewSurface(',start);
  const context=vm.createContext({});vm.runInContext(build.slice(start,end),context);
  return context.stripPublicClientScoreWriteSurface(text);
 });
 assert.equal(outputs[0],outputs[1]);return outputs[0];
}
function session(){
 let game = A, hold = null;
 const c = { Date, currentScoreStorageGameKey: () => game,
  LEADERBOARD: { configured: true, user: { id: 'pilot', email_confirmed_at: 'fixture' }, view: 'all' },
  RELEASE_CHANNEL: 'production beta', NON_PRODUCTION_LANE: true, window: {},
  TEST_ACCOUNT_EMAILS: [], TEST_ACCOUNT_USER_IDS: [], TEST_ACCOUNT_EMAIL: '', TEST_ACCOUNT_USER_ID: '',
  BUILD: 'fixture', normalizeScoreRecordGameKey: x=>x, scoreGameTitleForKey: x=>x===A?'Aurora Galactica':'Galaxy Guardians',
  scoreGameSupportsSharedRemote: (x=game)=>[A,G].includes(x), sanitizeInitials:x=>String(x),
  normalizeLeaderboardViewForLane:x=>x, shouldHideTestAccountScores:()=>false,
  localLeaderboardRows:()=>[], setLeaderboardStatus(){}, syncLeaderboardUi(){}, syncAccountUi(){},
  S: { best: 0 }, readPref:key=>storage.get(key), writePref:(key,value)=>storage.set(key,value),
  scoreBestKey:(key=game)=>`best:${key}`, scoreRowMatchesGame:(row,key=game)=>row.gameKey===key,
  LEADERBOARD_STALE_MS:45000, localStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value)},
  leaderboardCacheKey:(view,id=c.LEADERBOARD.user?.id||'anon')=>`${game}:${view}:${view==='mine'?id:''}`,
  platformLeaderboardCacheKey:(view,id)=>`platform:${c.leaderboardCacheKey(view,id)}`,
  legacyLeaderboardCacheKey:()=> 'legacy'
 };
 c.LEADERBOARD.client = { from(table){
  const filters=[];
  const q={select(){return q;},eq(k,v){filters.push(r=>r[k]===v);return q;},order(){return q;},limit(){return q;},
   async insert(payload){assert(!publicMode,'Public package must call checked RPC, never direct insert');database[table].push({...payload,id:String(database[table].length),achieved_at:'2026-10-17'});return {error:null};},
   then(resolve,reject){
    const data=database[table].filter(r=>filters.every(f=>f(r))).sort((a,b)=>b.score-a.score||b.stage-a.stage).slice(0,10).map(r=>({...r}));
    const result={data,error:null};
    return (hold?hold.then(()=>result):Promise.resolve(result)).then(resolve,reject);
   }};return q;
 }};
 c.LEADERBOARD.client.rpc=async(name,p)=>{
  assert.equal(name,'submit_platform_score');assert(c.LEADERBOARD.user?.id);
  assert.deepEqual(Object.keys(p).sort(),['p_build','p_game_key','p_initials','p_score','p_stage']);
  const table=p.p_game_key===A?'scores':'game_scores';
  database[table].push({id:String(database[table].length),game_key:p.p_game_key,initials:p.p_initials,score:p.p_score,stage:p.p_stage,build:p.p_build,user_id:c.LEADERBOARD.user.id,is_verified:false});
  return {data:'saved-id',error:null};
 };
 vm.createContext(c);
 vm.runInContext(source('03-platform-services.js'),c);
 vm.runInContext(source('04-leaderboard-ui.js'),c);
 vm.runInContext(publicMode?publicSource(source('11-leaderboard-service.js')):source('11-leaderboard-service.js'),c);
 // UI rendering is tested separately; execute real persistence and cache functions.
 c.syncLeaderboardUi=()=>{};c.syncAccountUi=()=>{};c.setLeaderboardStatus=()=>{};
 c.shouldHideTestAccountScores=()=>false;
 return {c,switchGame(value){game=value;},pause(){let release;hold=new Promise(r=>release=r);return ()=>{hold=null;release();};}};
}
async function flush(){await new Promise(r=>setImmediate(r));}
(async()=>{
 const one=session();
 for(const [game,score] of [[A,123],[G,456]]){
  one.switchGame(game);
  assert.equal(await one.c.submitScoreRemote({gameKey:game,score,stage:2,initials:'YES'}),1);
  await flush();
 }
 assert.equal(database.scores.length,1);assert.equal(database.game_scores.length,1);
 assert.equal(database.scores[0].game_key,A);assert.equal(database.game_scores[0].game_key,G);
 // Fresh runtime, same remote service: no in-memory scores from the first session.
 const two=session();
 for(const [game,score] of [[A,123],[G,456]]){
  two.switchGame(game);
  await two.c.refreshLeaderboard('mine',{force:1});
  assert.equal(two.c.LEADERBOARD.remote.mine.length,1);
  assert.equal(two.c.LEADERBOARD.remote.mine[0].score,score);
  assert.equal(two.c.LEADERBOARD.remote.mine[0].gameKey,game);
 }
 two.c.LEADERBOARD.user={id:'other'};
 await two.c.refreshLeaderboard('mine',{force:1});
 assert.equal(two.c.LEADERBOARD.remote.mine.length,0);
 const cached=session();cached.switchGame(G);cached.c.hydrateLeaderboardCache('mine');
 assert.equal(cached.c.LEADERBOARD.remote.mine[0].gameKey,G);
 cached.switchGame(A);cached.c.hydrateLeaderboardCache('mine');
 assert.equal(cached.c.LEADERBOARD.remote.mine[0].gameKey,A);
 // Late responses cannot repopulate the wrong game or user's cache.
 const race=session();const release=race.pause();
 const pending=race.c.refreshLeaderboard('all',{force:1});await flush();
 race.switchGame(G);race.c.ensureLeaderboardScope();release();await pending;
 assert.equal(race.c.LEADERBOARD.remote.all.length,0);
 await race.c.refreshLeaderboard('all',{force:1});assert.equal(race.c.S.best,456);
 race.switchGame(A);await race.c.refreshLeaderboard('all',{force:1});assert.equal(race.c.S.best,123);
 assert.equal(storage.get('best:'+G),'456');assert.equal(storage.get('best:'+A),'123');
 const stale=race.pause();const old=race.c.refreshLeaderboard('all',{force:1});await flush();
 race.c.LEADERBOARD.client={...race.c.LEADERBOARD.client};stale();await old;
 await race.c.refreshLeaderboard('all',{force:1});assert.equal(race.c.LEADERBOARD.loading.all,0);
 for(const lane of ['production','production beta']){
  race.c.RELEASE_CHANNEL=lane;race.c.LEADERBOARD.user=null;assert.equal(race.c.remoteWriteEnabled(),false);
  race.c.LEADERBOARD.user={id:'pilot'};assert.equal(race.c.remoteWriteEnabled(),true);
 }
 race.c.RELEASE_CHANNEL='development';assert.equal(race.c.remoteWriteEnabled(),false);
 console.log('PASS: both-game save/read across fresh sessions, private cache isolation, cross-user reads, stale game/client responses, best scores and signed-in lane policy. Fake service; not live-account acceptance.');
})().catch(e=>{console.error(e);process.exitCode=1;});

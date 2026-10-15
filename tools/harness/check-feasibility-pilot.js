const assert=require('assert/strict');
const {options,audit}=require('./feasibility-pilot');
assert.deepEqual(options([]),{stage:31,seed:9131,seconds:45,mode:'challenge'});
for(const args of [['--stage=32'],['--seed=0'],['--seconds=46'],['--mode=other'],['--mode=normal','--stage=31']])assert.throws(()=>options(args));
assert.equal(options(['--mode=normal','--stage=1']).stage,1);
function fixture(){
 const snapshot={player:{x:140,vx:0,spawn:0,captured:false,pending:false},lives:3};
 return {initial:{...snapshot,stats:{shots:0,hits:0},targetIds:Array.from({length:40},(_,i)=>i)},final:snapshot,
 frames:[{snapshot,stats:{shots:40,hits:40},bullets:[],cap:2,speed:440,cd:0}],
 events:[...Array.from({length:40},(_,id)=>[{type:'player_shot',t:id+.01,shots:1,dual:false,activeBullets:1,shotXs:[140]},
  {type:'enemy_killed',id,t:id+.02}]).flat(),{type:'challenge_clear',stage:31,hits:40,total:40}]};
}
const cfg=options([]);
assert(audit(fixture(),cfg).perfect);
const duplicate=fixture();duplicate.events[3].id=0;assert(!audit(duplicate,cfg).perfect);
const outside=fixture();outside.events[1].id=100;assert(!audit(outside,cfg).perfect);
const forced=fixture();forced.events.push({type:'harness_force_perfect_challenge_clear'});assert(!audit(forced,cfg).perfect);
const cap=fixture();cap.frames[0].bullets=Array.from({length:3},()=>({v:560}));assert(audit(cap,cfg).errors.includes('Bullet cap exceeded'));
const movement=fixture();movement.frames[0]={...movement.frames[0],snapshot:{...movement.final,player:{...movement.final.player,x:200}}};assert(audit(movement,cfg).errors.includes('Unexplained excessive movement'));
const cooldown=fixture();cooldown.events.push({type:'player_shot',t:1},{type:'player_shot',t:1.01});assert(audit(cooldown,cfg).errors.includes('Shot cooldown exceeded'));
const incomplete=fixture();incomplete.events=incomplete.events.filter(e=>e.type!=='challenge_clear');assert(!audit(incomplete,cfg).perfect);
const noShots=fixture();noShots.events=noShots.events.filter(e=>e.type!=='player_shot');noShots.frames[0].stats.shots=0;assert(!audit(noShots,cfg).perfect);
const immediateHitCap=fixture();immediateHitCap.events[0].activeBullets=3;assert(audit(immediateHitCap,cfg).errors.includes('Shot event post-push bullet cap exceeded'));
const counters=fixture();counters.frames[0].stats.shots=41;assert(!audit(counters,cfg).perfect);
console.log('PASS feasibility audit/options: duplicate/outside kills, forced clear, caps, movement, cooldown and missing clear rejected.');

#!/usr/bin/env node
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const input=path.resolve(process.argv[2]),output=process.argv[3]&&path.resolve(process.argv[3]);
if(output&&fs.existsSync(output))throw Error('Refusing to overwrite ledger evidence');
const bytes=fs.readFileSync(input),packet=JSON.parse(bytes),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const rows=packet.rows.map(r=>{
 const file=r.latest?.sessionFile||r.sessionFile,raw=fs.readFileSync(file),session=JSON.parse(raw).session;
 let ships=packet.ships,extendsTotal=0,captures=0,destructions=0,dualLosses=0,rescues=0;
 const events=[];
 for(const e of session.events){
  if(e.type==='extend_awarded'){extendsTotal+=e.awarded;ships+=e.awarded;assert.equal(ships,e.totalShips,`extend ledger ${r.seed}/${e.t}`);}
  else if(e.type==='fighter_captured'){ships--;captures++;assert.equal(ships,e.livesAfter,`capture ledger ${r.seed}/${e.t}`);}
  else if(e.type==='ship_lost'){assert.equal(ships,e.livesBefore,`loss ledger ${r.seed}/${e.t}`);destructions++;if(e.dual)dualLosses++;else ships--;}
  else if(e.type==='fighter_rescued'){rescues++;}
  else continue;
  events.push({...e,ledgerShips:ships});
 }
 assert.equal(ships,r.latest.lives,`terminal ledger ${r.seed}`);
 return {seed:r.seed,persona:r.persona,score:r.score,stage:r.stage,initialShips:packet.ships,extendsTotal,captures,destructions,dualLosses,rescues,
  terminalShips:ships,gameOver:r.latest.gameOver,simTime:r.latest.simTime,sessionFile:file,sessionHash:hash(raw),events};
});
const report={ok:true,input,inputHash:hash(bytes),sourceHash:packet.sourceHash,buildHash:packet.buildHash,requestedDuration:packet.duration,
 methodHash:hash(fs.readFileSync(__filename)),rows,limitations:['Rescued dual fighter is tracked separately; it does not add a reserve ship.','Event totals from unequal durations are not rates.']};
if(output)fs.writeFileSync(output,JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:true,runs:rows.length,rows:rows.map(({events,...r})=>r)},null,2));

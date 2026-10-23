const fs=require('node:fs'),{spawnSync}=require('node:child_process');
const rows=[];
for(const seed of [51101,51201,51301])for(const persona of ['expert','professional']){
 const r=spawnSync(process.execPath,['tools/harness/run-gameplay.js','--root',__dirname+'/input','--scenario','stage2-opening','--persona',persona,'--seed',String(seed),'--out',__dirname+'/runs','--auto-video','0'],{encoding:'utf8',timeout:120000,maxBuffer:30*1024*1024});
 fs.writeFileSync(`${__dirname}/${persona}-${seed}.log`,r.stdout+'\n'+r.stderr);
 if(r.status!==0)throw Error('Harness failed '+persona+'/'+seed);
 const p=JSON.parse(r.stdout);rows.push({seed,persona,score:p.state.score,kills:p.analysis.eventCounts.enemy_killed,losses:p.analysis.shipLost.length,files:p.files});
 console.log(JSON.stringify(rows.at(-1)));
}
const pass=[51101,51201,51301].every(seed=>{const e=rows.find(r=>r.seed===seed&&r.persona==='expert'),p=rows.find(r=>r.seed===seed&&r.persona==='professional');return p.score>=e.score&&p.kills>=e.kills&&p.losses<=e.losses;});
fs.writeFileSync(__dirname+'/short-results.json',JSON.stringify({pass,rows},null,2));
console.log({pass});process.exitCode=pass?0:1;

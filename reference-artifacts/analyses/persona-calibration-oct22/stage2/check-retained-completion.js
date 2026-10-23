const fs=require('node:fs'),{spawnSync}=require('node:child_process');
const rows=[];
for(const seed of [51101,51201])for(const persona of ['expert','professional']){
 const r=spawnSync(process.execPath,['tools/harness/run-gameplay.js','--root','dist/dev','--scenario',__dirname+'/stage2-diagnostic.json','--persona',persona,'--seed',String(seed),'--out',__dirname+'/retained-completion','--auto-video','0'],{encoding:'utf8',timeout:120000,maxBuffer:30*1024*1024});
 fs.writeFileSync(`${__dirname}/retained-completion-${persona}-${seed}.log`,r.stdout+'\n'+r.stderr);
 if(r.status!==0)throw Error('Run failed '+persona+'/'+seed);
 const p=JSON.parse(r.stdout),session=JSON.parse(fs.readFileSync(p.files[0])).session;
 const stage3=session.events.find(e=>e.type==='stage_spawn'&&e.stage===3),end=stage3?.t??Infinity;
 const events=session.events.filter(e=>e.t<end),clear=events.find(e=>e.type==='stage_clear');
 const row={seed,persona,firstClear:clear,stage3,kills:events.filter(e=>e.type==='enemy_killed').length,losses:events.filter(e=>e.type==='ship_lost'),captures:events.filter(e=>e.type==='fighter_captured'),captiveDestroyed:events.filter(e=>e.type==='captured_fighter_destroyed'),files:p.files};
 rows.push(row);console.log(JSON.stringify(row));
}
fs.writeFileSync(__dirname+'/retained-completion-results.json',JSON.stringify({diagnostic:true,acceptanceUnchanged:true,rows},null,2));

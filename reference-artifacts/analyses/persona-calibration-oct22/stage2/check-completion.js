const fs=require('node:fs'),{spawnSync}=require('node:child_process');
const rows=[];
for(const [label,root,persona] of [['expert','dist/dev','expert'],['retained','dist/dev','professional'],['rejected',__dirname+'/input','professional']]){
 const r=spawnSync(process.execPath,['tools/harness/run-gameplay.js','--root',root,'--scenario',__dirname+'/stage2-diagnostic.json','--persona',persona,'--seed','51301','--out',__dirname+'/completion/'+label,'--auto-video','0'],{encoding:'utf8',timeout:120000,maxBuffer:30*1024*1024});
 fs.writeFileSync(__dirname+'/completion-'+label+'.log',r.stdout+'\n'+r.stderr);
 if(r.status!==0)throw Error('Run failed '+label);
 const p=JSON.parse(r.stdout),session=JSON.parse(fs.readFileSync(p.files[0])).session;
 const stage3=session.events.find(e=>e.type==='stage_spawn'&&e.stage===3),end=stage3?.t??Infinity;
 const events=session.events.filter(e=>e.t<end),clear=events.find(e=>e.type==='stage_clear');
 const kills=events.filter(e=>e.type==='enemy_killed');
 const row={label,persona,firstClear:clear,stage3,scoreAtClear:clear?.score,scoreFromAwards:events.filter(e=>e.type==='score_awarded').reduce((n,e)=>n+(e.points||0),0),kills:kills.length,bossKills:kills.filter(e=>e.enemyType==='boss'),losses:events.filter(e=>e.type==='ship_lost'),captures:events.filter(e=>e.type==='fighter_captured'),files:p.files};
 rows.push(row);console.log(JSON.stringify(row));
}
fs.writeFileSync(__dirname+'/completion-results.json',JSON.stringify({diagnostic:true,acceptanceUnchanged:true,rows},null,2));

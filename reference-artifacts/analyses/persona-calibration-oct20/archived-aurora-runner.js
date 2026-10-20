const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const dir=path.join(__dirname,process.argv[2]||'diagnostic');
const start=Number(process.argv[3]||72001);
const personas=(process.argv[4]||'expert,professional').split(',');
fs.mkdirSync(dir,{recursive:true});
const output=path.join(dir,'results.json');
if(fs.existsSync(output))throw Error('Do not overwrite evidence');
const input=path.join(dir,'input');
fs.cpSync(path.join(root,'dist/dev'),input,{recursive:true});
const source=fs.readFileSync('src/js/05-player-flow.js');
fs.writeFileSync(path.join(dir,'candidate.js'),source);
const packet={date:'2026-10-20',sourceHash:hash(source),buildHash:hash(fs.readFileSync(path.join(input,'index.html'))),
 methodHash:hash(fs.readFileSync(__filename)),start,personas,duration:900,ships:3,stage:1,
 criteria:'Diagnostic only: neither tier regresses its prior median; no opening destruction; assess user goals separately. Freeze before fresh seeds.',rows:[]};
const jobs=personas.flatMap(persona=>Array.from({length:10},(_,i)=>({persona,seed:start+i})));
async function worker(){
 while(jobs.length){
  const job=jobs.shift(),id=`${job.persona}-${job.seed}`;
  const args=['tools/harness/run-gameplay.js','--root',input,'--scenario','private-artifacts/persona-distribution-oct18/aurora.json','--persona',job.persona,'--seed',String(job.seed),'--auto-video','0','--out',path.join(dir,id)];
  const result=await new Promise(resolve=>{
   const child=spawn(process.execPath,args,{cwd:root});let stdout='',stderr='';
   child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);
   const timer=setTimeout(()=>child.kill('SIGTERM'),240000);
   child.on('close',code=>{clearTimeout(timer);resolve({code,stdout,stderr});});
  });
  fs.writeFileSync(path.join(dir,id+'.log'),result.stdout+'\n'+result.stderr);
  if(result.code!==0)throw Error(`${id}: exit ${result.code}`);
  const r=JSON.parse(result.stdout);
  packet.rows.push({...job,stage:r.state.stage,score:r.state.score,losses:r.analysis.shipLost,eventCounts:r.analysis.eventCounts,latest:r.latest});
  fs.writeFileSync(output,JSON.stringify(packet,null,2));
  console.log(JSON.stringify({...job,stage:r.state.stage,score:r.state.score}));
 }
}
Promise.all(Array.from({length:3},worker)).then(()=>{
 packet.summary=Object.fromEntries(personas.map(p=>{
  const rows=packet.rows.filter(r=>r.persona===p),scores=rows.map(r=>r.score).sort((a,b)=>a-b);
  return[p,{median:(scores[4]+scores[5])/2,reach75k:scores.filter(x=>x>=75000).length,reach150k:scores.filter(x=>x>=150000).length,reach200k:scores.filter(x=>x>=200000).length,stages:rows.map(r=>r.stage),earlyDestructions:rows.flatMap(r=>r.losses).filter(l=>l.stage<=2).length}];
 }));
 packet.inputUnchanged=hash(fs.readFileSync(path.join(input,'index.html')))===packet.buildHash;
 fs.writeFileSync(output,JSON.stringify(packet,null,2));console.log(JSON.stringify(packet.summary));
}).catch(error=>{console.error(error);process.exitCode=1;});

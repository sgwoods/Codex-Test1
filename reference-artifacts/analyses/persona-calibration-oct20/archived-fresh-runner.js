const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {spawn,execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const output=path.join(__dirname,'results.json');
if(fs.existsSync(output))throw Error('Do not overwrite evidence');
const input=path.join(__dirname,'input');
fs.cpSync(path.join(root,'dist/dev'),input,{recursive:true});
const packet={baseline:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 date:'2026-10-20',dirty:true,sourceHash:hash(fs.readFileSync('src/js/05-player-flow.js')),
 buildHash:hash(fs.readFileSync(path.join(input,'index.html'))),
 methodHash:hash(fs.readFileSync(__filename)),
 criteria:{medianScoreMinimum:44522.5,minimumStage6:9,noEarlyDestruction:true},
 method:'Fresh seeds 85001-85010. Professional Watch. Stage1, 3 ships, 900s controlled clock. Frozen DEV input. No tuning.',rows:[]};
fs.writeFileSync(output,JSON.stringify(packet,null,2));
const jobs=Array.from({length:10},(_,i)=>85001+i);
async function worker(){
 while(jobs.length){
  const seed=jobs.shift();
  const args=['tools/harness/run-gameplay.js','--root',input,'--scenario','private-artifacts/persona-distribution-oct18/aurora.json','--persona','professional','--seed',String(seed),'--auto-video','0','--out',path.join(__dirname,String(seed))];
  const {code,stdout,stderr}=await new Promise(resolve=>{
   const child=spawn(process.execPath,args,{cwd:root});let stdout='',stderr='';
   child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);
   const timer=setTimeout(()=>child.kill('SIGTERM'),240000);
   child.on('close',code=>{clearTimeout(timer);resolve({code,stdout,stderr});});
  });
  fs.writeFileSync(path.join(__dirname,`${seed}.log`),stdout+'\n'+stderr);
  if(code!==0)throw Error(`Seed ${seed}: exit ${code}`);
  const r=JSON.parse(stdout);
  packet.rows.push({seed,stage:r.state.stage,score:r.state.score,losses:r.analysis.shipLost,eventCounts:r.analysis.eventCounts,latest:r.latest});
  fs.writeFileSync(output,JSON.stringify(packet,null,2));
  console.log(JSON.stringify({seed,stage:r.state.stage,score:r.state.score}));
 }
}
Promise.all(Array.from({length:3},worker)).then(()=>{
 packet.rows.sort((a,b)=>a.seed-b.seed);
 const scores=packet.rows.map(r=>r.score).sort((a,b)=>a-b);
 packet.median=(scores[4]+scores[5])/2;
 packet.inputUnchanged=hash(fs.readFileSync(path.join(input,'index.html')))===packet.buildHash;
 packet.pass=packet.inputUnchanged&&packet.median>=packet.criteria.medianScoreMinimum&&packet.rows.filter(r=>r.stage>=6).length>=9&&packet.rows.every(r=>!r.losses.some(l=>l.stage<=2));
 fs.writeFileSync(output,JSON.stringify(packet,null,2));
 console.log(JSON.stringify({median:packet.median,pass:packet.pass}));
}).catch(error=>{console.error(error);process.exitCode=1;});

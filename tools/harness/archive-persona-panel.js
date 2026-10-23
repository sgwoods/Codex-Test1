#!/usr/bin/env node
// Preserve raw evidence privately and emit a portable, data-minimized public packet.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'../..');
const [inputArg,name]=process.argv.slice(2);
if(!inputArg||!name||!/^[a-z0-9-]+$/.test(name))throw Error('Usage: archive-persona-panel.js results.json panel-name');
const input=path.resolve(inputArg),raw=fs.readFileSync(input),p=JSON.parse(raw);
if(!p.inputUnchanged||!p.summary)throw Error('Panel is incomplete or input changed');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const rel=p=>path.relative(root,p).split(path.sep).join('/');
const publicDir=path.join(root,'reference-artifacts/analyses/persona-calibration-oct20/capture-rescue',name);
const privateDir=path.join(root,'private-artifacts/persistent/persona-capture-rescue-oct20',name);
if(fs.existsSync(publicDir)||fs.existsSync(privateDir))throw Error('Do not overwrite archived evidence');
const candidate=fs.readFileSync(path.join(path.dirname(input),'candidate.js'));
if(sha(candidate)!==p.sourceHash)throw Error('Controller snapshot mismatch');
const build=fs.readFileSync(path.join(path.dirname(input),'input/index.html'));
if(sha(build)!==p.buildHash)throw Error('Frozen build mismatch');
fs.mkdirSync(publicDir,{recursive:true});fs.mkdirSync(privateDir,{recursive:true});
const artifacts=[];
function preserve(name,bytes){
 const compressed=zlib.gzipSync(bytes,{level:9}),file=path.join(privateDir,name+'.gz');
 fs.writeFileSync(file,compressed);
 if(sha(zlib.gunzipSync(fs.readFileSync(file)))!==sha(bytes))throw Error('Archive recovery failed');
 artifacts.push({path:rel(file),sha256:sha(compressed),originalSha256:sha(bytes),originalBytes:bytes.length,compressedBytes:compressed.length});
}
preserve('results.json',raw);preserve('index.html',build);
for(const r of p.rows)preserve(`${r.persona}-${r.seed}.json`,fs.readFileSync(path.resolve(root,r.latest.sessionFile)));
const packet={schemaVersion:1,date:p.date,sourceHash:p.sourceHash,buildHash:p.buildHash,methodHash:p.methodHash,scenarioHash:p.scenarioHash,
 inputHash:sha(raw),duration:p.duration,ships:p.ships,stage:p.stage,start:p.start,personas:p.personas,summary:p.summary,inputUnchanged:true,
 rows:p.rows.map(r=>({persona:r.persona,seed:r.seed,score:r.score,stage:r.stage,losses:r.losses,eventCounts:r.eventCounts,
  latest:{gameOver:r.latest.gameOver,lives:r.latest.lives,simTime:r.latest.simTime,watchMode:r.latest.watchMode,watchPersona:r.latest.watchPersona}})),
 limitations:['Raw sessions/build are retained in the ignored private archive; off-machine backup is not verified.',
  'Time-limit scores are censored lower bounds, not final career scores. Ten-seed panels are not population guarantees.']};
fs.writeFileSync(path.join(publicDir,'results.json'),JSON.stringify(packet,null,2)+'\n');
fs.writeFileSync(path.join(publicDir,'controller.js'),candidate);
fs.writeFileSync(path.join(publicDir,'provenance.json'),JSON.stringify({archiveMethodHash:sha(fs.readFileSync(__filename)),artifacts},null,2)+'\n');
console.log(JSON.stringify({publicDir:rel(publicDir),privateDir:rel(privateDir),runs:p.rows.length,rawRecoveryVerified:true}));

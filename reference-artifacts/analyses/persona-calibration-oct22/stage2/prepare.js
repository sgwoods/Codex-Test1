const fs=require('node:fs'),crypto=require('node:crypto');
const dir=__dirname,sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const baseline=fs.readFileSync('src/js/05-player-flow.js','utf8');
if(sha(baseline)!=='a27c906faec56611e3295e3cc06edff59d869de70c8cf4c5cb6f6c709c0e6dfd')throw Error('Baseline mismatch');
if(fs.existsSync(dir+'/candidate.js'))throw Error('Do not overwrite');
let source=baseline;
function replace(a,b){if(source.split(a).length!==2)throw Error('Ambiguous source');source=source.replace(a,b);}
replace(' return base;\n}\n\nfunction harnessTargetScore'," if(key==='professional'&&S.stage===2&&!S.challenge)return Object.assign({},base,{deadZone:7});\n return base;\n}\n\nfunction harnessTargetScore");
replace("if(cfg.name!=='professional'||state.challenge||state.stage<4)return preferredAxis;","if(cfg.name!=='professional'||state.challenge||(state.stage<4&&state.stage!==2))return preferredAxis;");
const html=fs.readFileSync('dist/dev/index.html','utf8');
if(html.split(baseline).length!==2)throw Error('Current build/source mismatch');
fs.cpSync('dist/dev',dir+'/input',{recursive:true});
fs.writeFileSync(dir+'/input/index.html',html.replace(baseline,source));
fs.writeFileSync(dir+'/candidate.js',source);
fs.writeFileSync(dir+'/baseline.js',baseline);
fs.writeFileSync(dir+'/acceptance.json',JSON.stringify({date:'2026-10-22',baseline:sha(baseline),candidate:sha(source),scope:'Professional normal Stage2 deadZone7 plus existing two-step hazard resolver. No other policy change.',short:{seeds:[51101,51201,51301],require:'Professional >= Expert score/kills, <= losses on every seed'},matched:{seeds:'89001-89010',duration:900,medianAtLeast:326720,minimumAtLeast:189800,reach150k:10,reach200kAtLeast:9,earlyDestructionsAtMost:1},fresh:{seeds:'92001-92010',reach150kAtLeast:8},stop:'If short gate fails, reject. If matched fails, reject. Do not alter thresholds.'},null,2));
console.log(sha(source));

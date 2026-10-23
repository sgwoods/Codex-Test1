const fs=require('node:fs'),crypto=require('node:crypto');
const from='private-artifacts/stage2-conflict-all-bodies-oct22',dir=__dirname,hash=x=>crypto.createHash('sha256').update(x).digest('hex');
if(fs.existsSync(dir+'/candidate.js'))throw Error('Refuse overwrite');
const previous=fs.readFileSync(from+'/candidate.js','utf8');
const source=previous.replace('if(state.captureCountStage>0||p.dual)p.hCaptureRiskSpent=true;','if(state.stage>=4&&(state.captureCountStage>0||p.dual))p.hCaptureRiskSpent=true;').replace('if((p.hCaptureRiskSpent||state.lives<2)&&canCapture(state))','if(state.stage>=4&&(p.hCaptureRiskSpent||state.lives<2)&&canCapture(state))');
fs.cpSync(from+'/input',dir+'/input',{recursive:true});const html=fs.readFileSync(from+'/input/index.html','utf8');if(html.split(previous).length!==2)throw Error('Build mismatch');fs.writeFileSync(dir+'/input/index.html',html.replace(previous,source));
fs.writeFileSync(dir+'/candidate.js',source);for(const file of ['baseline.js','check-short.js','check-fixture.js'])fs.copyFileSync(from+'/'+file,dir+'/'+file);
const acceptance=JSON.parse(fs.readFileSync(from+'/acceptance.json'));Object.assign(acceptance,{createdAt:new Date().toISOString(),candidate:hash(source),scope:acceptance.scope+' Review correction: capture-budget and beam policy remain Stage4+ only.'});fs.writeFileSync(dir+'/acceptance.json',JSON.stringify(acceptance,null,2));console.log(hash(source));

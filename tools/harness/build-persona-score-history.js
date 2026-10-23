#!/usr/bin/env node
// Regenerate documentation from archived measurements; never run or tune gameplay.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const out = path.join(root, 'reference-artifacts/analyses/persona-score-history');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const sources = [];
function read(file) {
  const bytes = fs.readFileSync(path.join(root, file));
  sources.push({file, sha256: sha(bytes)});
  return JSON.parse(bytes);
}
const old = read('reference-artifacts/analyses/persona-calibration-oct18/runs.json');
const provenance = read('reference-artifacts/analyses/persona-calibration-oct18/provenance.json');
const later = read('reference-artifacts/analyses/persona-calibration-oct20/aurora-fresh-distribution.json');
const hazards = read('reference-artifacts/analyses/persona-calibration-oct20/hazard-arbitration.json');
const outcomes = read('reference-artifacts/analyses/persona-score-history/hazard-outcomes.json');
for(const [key,p] of Object.entries(hazards)){
  if(outcomes[key].sha256!==p.rawHash)throw Error('Outcome provenance mismatch');
  for(const r of p.rows){
    const match=outcomes[key].rows.find(o=>o.seed===r.seed&&o.persona===r.persona);
    if(!match||match.score!==r.score||typeof match.gameOver!=='boolean')throw Error('Outcome mismatch');
    r.outcome=match.gameOver?'game-over':'time-limit';
  }
}
const guardians = read('reference-artifacts/analyses/persona-calibration-oct18/stage3-ladder-receipt.json');
const joint = read('reference-artifacts/analyses/persona-calibration-oct20/stage2-joint-fresh.json');
const matched = read('reference-artifacts/analyses/persona-calibration-oct20/stage2-matched-baseline.json');
const lookahead = read('reference-artifacts/analyses/persona-calibration-oct20/lookahead-trial/results.json');
const rescueRoot='reference-artifacts/analyses/persona-calibration-oct20/capture-rescue/';
const rescueMatched=read(rescueRoot+'rescue-matched/results.json');
const rescueFresh=read(rescueRoot+'rescue-fresh/results.json');
const rescueLadder=read(rescueRoot+'integrated-ladder/results.json');
const rescueBaseline=read(rescueRoot+'ladder-baseline/results.json');
const safety=read('reference-artifacts/analyses/persona-calibration-oct22/safety-qualification/results.json');
const normalize = r => ({persona:r.persona, seed:r.seed, score:r.score, stage:r.stage,
  outcome:r.outcome || (typeof r.latest?.gameOver === 'boolean' ? (r.latest.gameOver ? 'game-over':'time-limit') : 'unknown')});
const versions = [
  ...[['A6d','baseline','retained control recheck'],['A7','candidate','conflict repair (REJECTED)']].map(([id,policy,label])=>({id,game:'aurora',label:'Oct 22 | '+label,identity:safety[policy==='baseline'?'baselineHash':'candidateHash'],method:'Browser Watch',seeds:'89001-89010',rows:safety.rows.filter(r=>r.policy===policy).map(normalize)})),
  {id:'A1',game:'aurora',label:'Oct 18 | opening repair',identity:provenance.hashes['src/js/05-player-flow.js'],method:'Browser Watch',seeds:'72001-72010',rows:old.filter(r=>r.game==='aurora').map(normalize)},
  {id:'A2',game:'aurora',label:'Oct 20 | later-stage policy',identity:later.sourceHash,method:'Browser Watch',seeds:'87001-87010',rows:later.rows.map(normalize)},
  ...Object.entries(hazards).map(([key,p],i)=>({id:i?'A3b':'A3a',game:'aurora',label:i?'Oct 20 | hazard policy, new seeds':'Oct 20 | hazard policy, paired seeds',identity:p.sourceHash,method:'Browser Watch',seeds:i?'88001-88010':'87001-87010',rows:p.rows.map(normalize)})),
  {id:'A3c',game:'aurora',label:'Oct 20 | retained hazard policy, matched baseline',identity:matched.sourceHash,method:'Browser Watch',seeds:'89001-89010',rows:matched.rows.map(normalize)},
  {id:'A4',game:'aurora',label:'Oct 20 | Stage 2 joint policy (REJECTED)',identity:joint.sourceHash,method:'Browser Watch',seeds:'89001-89010',rows:joint.rows.map(normalize)},
  {id:'A5',game:'aurora',label:'Oct 20 | two-step motion lookahead (REJECTED)',identity:lookahead.sourceHash,method:'Browser Watch',seeds:'89001-89010',rows:lookahead.rows.map(normalize)},
  ...[['A6a','rescue-aware keeper, matched','89001-89010',rescueMatched],['A6b','rescue-aware keeper, fresh','90001-90010',rescueFresh],['A6c','integrated skill ladder, fresh','91001-91010',rescueLadder],['A3d','old policy control for A6c','91001-91010',rescueBaseline]].map(([id,label,seeds,p])=>({id,game:'aurora',label:'Oct 20 | '+label,identity:p.sourceHash,method:'Browser Watch',seeds,rows:p.rows.map(normalize)})),
  {id:'G1',game:'guardians',label:'Oct 18 | opening repair',identity:provenance.hashes['src/js/13-galaxy-guardians-gameplay-adapter.js'],method:'Browser Watch',seeds:'72001-72010',rows:old.filter(r=>r.game==='guardians').map(normalize)},
  {id:'G2',game:'guardians',label:'Oct 19 | Expert pursuit extension',identity:'See stage3-ladder-receipt.json and STAGE3-AND-LADDER.md',method:'Runtime VM; one browser cross-check',seeds:'84001-84010',rows:guardians.heldout.runs.map(r=>({...normalize(r),persona:'expert',outcome:r.gameOver?'game-over':'time-limit'}))}
];
const names = {novice:'Beginner',advanced:'Intermediate',expert:'Expert',professional:'Professional'};
const colors = {novice:'#657585',advanced:'#087f8c',expert:'#7652aa',professional:'#c24743'};
const median = a => {const b=[...a].sort((x,y)=>x-y);return (b[(b.length-1)>>1]+b[b.length>>1])/2;};
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
function chart(game,ids=null) {
  const panels=versions.filter(v=>v.game===game&&(!ids||ids.includes(v.id))), max=game==='aurora'?400000:20000;
  const width=1400,height=170+panels.length*260;
  let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img"><title>${game} persona score distributions</title><rect width="100%" height="100%" fill="#ffffff"/><style>text{font-family:Arial,sans-serif;fill:#20252b;font-size:17px}.small{font-size:14px;fill:#52616b}.title{font-size:29px;font-weight:bold}.heading{font-size:20px;font-weight:bold}</style>`;
  const text=(x,y,s,cls='')=>`<text x="${x}" y="${y}" class="${cls}">${esc(s)}</text>`;
  svg+=text(36,42,`${game==='aurora'?'Aurora':'Guardians'} | Persona score history`,'title');
  svg+=text(36,72,'One point per run; black bar = median. Filled circle = game over; triangle = time limit; hollow circle = outcome unavailable.','small');
  svg+=text(36,96,'Stage 1 / three ships / 900-second budget. Local policy snapshots, not released versions. Different seed panels are not paired.','small');
  panels.forEach((v,i)=>{
    const top=126+i*260,left=225,right=1125,scale=s=>left+s/max*(right-left);
    svg+=text(36,top,`${v.id}  ${v.label}`,'heading');
    svg+=text(36,top+23,`${v.method} | seeds ${v.seeds} | ${v.id==='G2'?'source hash not recorded in receipt':`source ${v.identity.slice(0,12)}`}`,'small');
    for(let t=0;t<=max;t+=max/4){const x=scale(t);svg+=`<path d="M${x} ${top+36}V${top+203}" stroke="#e0e4e8"/>`;svg+=text(x-12,top+224,`${t/1000}k`,'small');}
    Object.keys(names).forEach((p,j)=>{
      const y=top+57+j*43,rows=v.rows.filter(r=>r.persona===p).sort((a,b)=>a.seed-b.seed);
      svg+=text(36,y+5,names[p]);
      if(!rows.length){svg+=text(left+12,y+5,'Not tested in this snapshot','small');return;}
      if(game==='aurora'&&(p==='expert'||p==='professional')){
        const x=scale(p==='expert'?75000:150000);svg+=`<path d="M${x} ${y-17}V${y+17}" stroke="#a2aab1" stroke-dasharray="3 3"/>`;
      }
      rows.forEach((r,k)=>{const x=scale(r.score),yy=y+((k%5)-2)*4;
        const tip=`${names[p]} seed ${r.seed}: ${r.score} points, stage ${r.stage}, ${r.outcome}`;
        svg+=r.outcome==='time-limit'?`<path d="M${x} ${yy-6}l-6 11h12z" fill="${colors[p]}"><title>${tip}</title></path>`:`<circle cx="${x}" cy="${yy}" r="5" fill="${r.outcome==='unknown'?'white':colors[p]}" stroke="${colors[p]}" stroke-width="2"><title>${tip}</title></circle>`;
      });
      const m=median(rows.map(r=>r.score)),x=scale(m);
      svg+=`<path d="M${x} ${y-16}V${y+16}" stroke="#111111" stroke-width="3"/>`;
      svg+=text(1150,y+5,`${m.toLocaleString('en-US')} | n=${rows.length}`,'small');
    });
  });
  svg+=text(36,height-15,game==='aurora'?'Dashed marks: Expert 75k and Professional 150k targets. Censored scores are lower bounds, not final career scores.':'Guardians uses its own score scale. Later Expert data do not establish the current ranking of the other personas.','small');
  return svg+'</svg>';
}
for(const v of versions){
  const keys=new Set();
  for(const r of v.rows){if(!Number.isFinite(r.score)||r.score<0||keys.has(`${r.persona}/${r.seed}`))throw Error(`Invalid run ${v.id}`);keys.add(`${r.persona}/${r.seed}`);}
  for(const p of new Set(v.rows.map(r=>r.persona)))if(v.rows.filter(r=>r.persona===p).length!==10)throw Error(`Expected 10 runs: ${v.id}/${p}`);
}
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'history.json'),JSON.stringify({schemaVersion:1,sources,versions},null,2)+'\n');
for(const game of ['aurora','guardians'])fs.writeFileSync(path.join(out,`${game}-score-history.svg`),chart(game));
fs.writeFileSync(path.join(out,'aurora-current-ladder.svg'),chart('aurora',['A6c','A3d']));
fs.writeFileSync(path.join(out,'aurora-safety-comparison.svg'),chart('aurora',['A6d','A7']));
console.log(`Validated ${versions.length} panels, ${versions.reduce((n,v)=>n+v.rows.length,0)} observed runs; generated history.json and SVG charts.`);

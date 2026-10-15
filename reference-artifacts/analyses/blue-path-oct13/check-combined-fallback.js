const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname,'../..');
const baselineFile = path.join(root,'private-artifacts/blue-path-setup-oct13/baseline/source-overlay/src/js/06-enemy-behavior.js');
const candidateFile = path.join(root,'src/js/06-enemy-behavior.js');
const input = process.argv[2] || path.join(__dirname,'fallback-input-analytic.json');
const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const fixtures = JSON.parse(fs.readFileSync(input)).fixtures;
const variants = [{routeCurveX:8},{routeCurveY:8},{deconflictLaneBias:8},
  {deconflictYOffset:8},{spacingFieldGateS:100,spacingFieldSpreadX:10}];
const dimensions = e => ({w:e.t==='boss'?38:e.t==='but'?34:e.t==='rogue'?35:32,
  h:e.t==='boss'?30:e.t==='but'?27:e.t==='rogue'?28:26});
function evaluator(source,fixture) {
  const context = vm.createContext({Math,Number,PLAY_W:280,PLAY_H:360,
    isAuroraRuntimeState:()=>true,familyMotion:()=>fixture.family,
    cl:(v,a,b)=>Math.max(a,Math.min(b,v)),enemyChallengeUpperBandY:()=>144,enemyDims:dimensions});
  vm.runInContext(source,context);
  return (u,overrides={}) => {
    const e={...fixture.enemy,...overrides,spawn:0,hp:1,miss:0,ub:0,
      tm:u-(fixture.enemy.phaseOffsetS||0)-(fixture.enemy.lanePhaseOffsetS||0)};
    context.updateChallengeEnemy({stage:31},e,0);
    return {x:e.x,y:e.y,hp:e.hp,miss:e.miss,ub:e.ub};
  };
}
const report={methodHash:hash(__filename),inputHash:hash(input),baselineSourceHash:hash(baselineFile),
  candidateSourceHash:hash(candidateFile),fallbackChecks:0,rightBoundaryChecks:0,pass:false,
  limits:'Supplemental actual-function VM checks with captured authored parameters; pose resets and helper stubs do not replace full-runtime validation.'};
for(const fixture of fixtures) {
  const original=evaluator(fs.readFileSync(baselineFile,'utf8'),fixture);
  const candidate=evaluator(fs.readFileSync(candidateFile,'utf8'),fixture);
  for(const overrides of variants)for(const u of [9.3,9.7,10.05,10.65,11.05,11.65,13,15]) {
    assert.deepEqual(candidate(u,overrides),original(u,overrides),JSON.stringify({id:fixture.enemy.id,u,overrides}));
    report.fallbackChecks++;
  }
  for(const offset of [150,250,350,500])for(let u=11.65;u<13;u+=.025) {
    const pose=candidate(u,{routeOffsetX:offset});
    if(pose.x>334&&Math.round(pose.y)+dimensions(fixture.enemy).h>=0&&pose.y<=394) {
      assert.equal(pose.hp,1,'Leftward departure was removed at right boundary');
      report.rightBoundaryChecks++;
    }
  }
}
assert(report.rightBoundaryChecks>0);
report.pass=true;
fs.writeFileSync(path.join(__dirname,'combined-fallback.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));

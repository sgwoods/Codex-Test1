const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { withHarnessPage } = require('../../tools/harness/browser-check-util');

async function main() {
  const [rootArg, outArg] = process.argv.slice(2);
  const root = path.resolve(rootArg), out = path.resolve(outArg);
  const baseline = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../reference-artifacts/analyses/blue-path-oct13/baseline-exits.json')));
  const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const cases = [{stage:31,column:60,id:214629079},{stage:35,column:140,id:287155051},
    {stage:39,column:140,id:973487328},{stage:39,column:140,id:119292102},{stage:35,column:60,id:709952769}];
  fs.mkdirSync(out, { recursive: true });
  const report = { bundleHash: hash(path.join(root, 'index.html')), methodHash: hash(__filename),
    scheduleBundleHash: baseline.bundleHash, cases: [] };
  for (const theme of ['aurora-crown','classic-arcade']) for (const cfg of cases) {
    const source = baseline.results.find(r => r.stage === cfg.stage && r.column === cfg.column && r.theme === theme);
    const event = source.contacts.find(e => e.id === cfg.id);
    if (!event) throw new Error('Missing baseline contact');
    const contactFrame = Math.round(event.t * 60) - 1;
    const frames = [contactFrame - 2,contactFrame,contactFrame + 2];
    const result = await withHarnessPage({root,skipStart:true}, async ({page}) => {
      await page.clock.install({time:new Date('2026-10-13T00:00:00Z')});
      await page.clock.pauseAt(new Date('2026-10-13T00:00:01Z'));
      return page.evaluate(({cfg,theme,frames}) => {
        const h = window.__galagaHarness__;
        h.start({controlledClock:true,stageMode:'display',startKind:'challenge',stage:cfg.stage,
          challengeStage:(cfg.stage+1)/4,seed:9100+cfg.stage,ships:3,persona:null,
          expertPlays:'human',playerTwo:false,autoVideo:false,graphicsTheme:theme});
        const code = cfg.column < 140 ? 'ArrowLeft' : 'ArrowRight';
        let held = cfg.column !== 140;
        if (held) window.dispatchEvent(new KeyboardEvent('keydown',{code,bubbles:true}));
        const captures = [];
        for (let frame=0;frame<=Math.max(...frames);frame++) {
          h.advanceFor(1/60,{step:1/60,stopOnGameOver:false});
          const s = h.snapshot();
          if (held && (cfg.column < 140 ? s.player.x<=cfg.column+4 : s.player.x>=cfg.column-4)) {
            window.dispatchEvent(new KeyboardEvent('keyup',{code,bubbles:true}));held=false;
          }
          if (!frames.includes(frame)) continue;
          h.redraw();
          const alive = h.challengeFormationState().enemies.some(e=>e.id===cfg.id);
          captures.push({frame,snapshot:s,diagnostic:alive?h.challengeContactDiagnostics(cfg.id):null,
            playerBounds:window.__platinumRenderDebug?.playerBounds,
            png:document.getElementById('c').toDataURL('image/png')});
        }
        if (held) window.dispatchEvent(new KeyboardEvent('keyup',{code,bubbles:true}));
        return {cfg,theme,resolvedTheme:h.state().visualAtmosphere?.overrideThemeId,captures};
      },{cfg,theme,frames});
    });
    if (result.resolvedTheme !== theme) throw new Error('Theme mismatch');
    for (const capture of result.captures) {
      capture.file = `${theme}-${cfg.stage}-${cfg.column}-${cfg.id}-${capture.frame}.png`;
      fs.writeFileSync(path.join(out,capture.file),Buffer.from(capture.png.split(',')[1],'base64'));
      delete capture.png;
      capture.hash = hash(path.join(out,capture.file));
    }
    report.cases.push(result);
  }
  if (hash(path.join(root,'index.html')) !== report.bundleHash) throw new Error('Artifact changed');
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({out,bundleHash:report.bundleHash,frames:report.cases.reduce((n,c)=>n+c.captures.length,0)}));
}
main().catch(error=>{console.error(error);process.exitCode=1;});

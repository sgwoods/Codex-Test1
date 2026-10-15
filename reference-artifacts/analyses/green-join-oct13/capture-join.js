const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { withHarnessPage } = require('../../tools/harness/browser-check-util');

async function main() {
  const root = path.resolve(process.argv[2]);
  const out = path.resolve(process.argv[3]);
  const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  fs.mkdirSync(out, { recursive: true });
  const report = { bundleHash: hash(path.join(root, 'index.html')), methodHash: hash(__filename),
    stage: 35, seed: 9135, targetId: 571262010, cases: [] };
  for (const theme of ['aurora-crown', 'classic-arcade']) {
    const result = await withHarnessPage({ root, skipStart: true }, async ({ page }) => page.evaluate(({ theme, targetId }) => {
      const h = window.__galagaHarness__;
      h.start({ controlledClock: true, stageMode: 'display', startKind: 'challenge',
        stage: 35, challengeStage: 9, seed: 9135, ships: 3, persona: null,
        expertPlays: 'human', graphicsTheme: theme, autoVideo: false });
      const captures = [];
      for (let frame = 0; frame <= 470; frame++) {
        h.advanceFor(1 / 60, { step: 1 / 60, stopOnGameOver: false });
        if (![455, 456, 457, 460, 468].includes(frame)) continue;
        h.redraw();
        captures.push({ frame, snapshot: h.snapshot(), diagnostic: h.challengeContactDiagnostics(targetId),
          png: document.getElementById('c').toDataURL('image/png') });
      }
      return { theme, resolvedTheme: h.state().visualAtmosphere?.overrideThemeId, captures };
    }, { theme, targetId: report.targetId }));
    if (result.resolvedTheme !== theme) throw new Error('Theme mismatch');
    for (const capture of result.captures) {
      capture.file = `${theme}-${capture.frame}.png`;
      fs.writeFileSync(path.join(out, capture.file), Buffer.from(capture.png.split(',')[1], 'base64'));
      delete capture.png;
      capture.hash = hash(path.join(out, capture.file));
    }
    report.cases.push(result);
  }
  if (hash(path.join(root, 'index.html')) !== report.bundleHash) throw new Error('Bundle changed');
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ out, bundleHash: report.bundleHash, frames: report.cases.map(c => c.captures.length) }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });

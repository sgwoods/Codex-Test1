const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { ROOT, withHarnessPage } = require('../../tools/harness/browser-check-util');

async function main() {
  const root = path.resolve(process.argv[2]);
  const out = path.resolve(process.argv[3]);
  const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, 'baseline-captures/report.json')));
  fs.mkdirSync(out, { recursive: true });
  const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const report = { bundle: hash(path.join(root, 'index.html')), baselineBundle: baseline.bundle,
    method: hash(__filename), results: [] };
  for (const reference of baseline.results) {
    const request = { theme: reference.theme, targetX: reference.targetX,
      frames: reference.captures.map(({ frame, event, offset }) => ({ frame, event, offset })) };
    const result = await withHarnessPage({ root, skipStart: true }, async ({ page }) => page.evaluate(request => {
      const h = window.__galagaHarness__, captures = [];
      h.start({ controlledClock: true, stageMode: 'display', startKind: 'challenge', stage: 31,
        challengeStage: 8, seed: 9131, ships: 3, persona: null, expertPlays: 'human',
        graphicsTheme: request.theme, autoVideo: false });
      const code = request.targetX < 140 ? 'ArrowLeft' : 'ArrowRight';
      window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true }));
      let held = true;
      for (let frame = 0; frame <= Math.max(...request.frames.map(f => f.frame)); frame++) {
        h.advanceFor(1 / 60, { step: 1 / 60, stopOnGameOver: false });
        const s = h.snapshot();
        if (held && (request.targetX < 140 ? s.player.x <= request.targetX + 4 : s.player.x >= request.targetX - 4)) {
          window.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true }));
          held = false;
        }
        for (const item of request.frames.filter(f => f.frame === frame)) {
          h.redraw();
          captures.push({ ...item, snapshot: s, diagnostic: h.challengeContactDiagnostics(item.event.id),
            render: window.__platinumRenderDebug?.playerBounds,
            png: document.getElementById('c').toDataURL('image/png') });
        }
      }
      if (held) window.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true }));
      return { theme: request.theme, targetX: request.targetX, captures };
    }, request));
    for (const capture of result.captures) {
      const file = `${result.theme}-${result.targetX}-${capture.event.id}-${capture.offset}.png`;
      fs.writeFileSync(path.join(out, file), Buffer.from(capture.png.split(',')[1], 'base64'));
      delete capture.png;
      capture.file = file;
      capture.hash = hash(path.join(out, file));
    }
    report.results.push(result);
  }
  if (hash(path.join(root, 'index.html')) !== report.bundle) throw new Error('Bundle changed');
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ out, bundle: report.bundle, count: report.results.reduce((n, r) => n + r.captures.length, 0) }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });

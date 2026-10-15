const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { ROOT, withHarnessPage } = require('../../tools/harness/browser-check-util');

async function main() {
  const root = path.resolve(process.argv[2] || path.join(ROOT, 'dist/dev'));
  const out = path.resolve(process.argv[3] || path.join(__dirname, 'baseline-captures'));
  fs.mkdirSync(out, { recursive: true });
  const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const report = { bundle: hash(path.join(root, 'index.html')), method: hash(__filename), results: [] };
  for (const theme of ['aurora-crown', 'classic-arcade']) {
    for (const targetX of [60, 250]) {
      const result = await withHarnessPage({ root, skipStart: true }, async ({ page }) => page.evaluate(({ theme, targetX }) => {
        const h = window.__galagaHarness__;
        h.start({ controlledClock: true, stageMode: 'display', startKind: 'challenge', stage: 31,
          challengeStage: 8, seed: 9131, ships: 3, persona: null, expertPlays: 'human',
          graphicsTheme: theme, autoVideo: false });
        const code = targetX < 140 ? 'ArrowLeft' : 'ArrowRight';
        window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true }));
        let held = true;
        const seen = new Set(), pending = [], captures = [];
        for (let frame = 0; frame < 1500; frame++) {
          h.advanceFor(1 / 60, { step: 1 / 60, stopOnGameOver: false });
          const s = h.snapshot();
          if (held && (targetX < 140 ? s.player.x <= targetX + 4 : s.player.x >= targetX - 4)) {
            window.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true }));
            held = false;
          }
          for (const event of h.recentEvents({ count: 300 })) {
            if (event.type === 'challenge_enemy_contact' && !seen.has(event.id)) {
              seen.add(event.id);
              for (const offset of [0, 2, 4]) pending.push({ frame: frame + offset, event, offset });
            }
          }
          for (const item of pending.filter(p => p.frame === frame)) {
            h.redraw();
            captures.push({ ...item, snapshot: s, diagnostic: h.challengeContactDiagnostics(item.event.id),
              render: window.__platinumRenderDebug?.playerBounds,
              png: document.getElementById('c').toDataURL('image/png') });
          }
          if (!h.challengeFormationState().enemies.length) break;
        }
        if (held) window.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true }));
        return { theme, targetX, captures, final: h.snapshot() };
      }, { theme, targetX }));
      for (const capture of result.captures) {
        const file = `${theme}-${targetX}-${capture.event.id}-${capture.offset}.png`;
        fs.writeFileSync(path.join(out, file), Buffer.from(capture.png.split(',')[1], 'base64'));
        delete capture.png;
        capture.file = file;
        capture.hash = hash(path.join(out, file));
      }
      report.results.push(result);
    }
  }
  if (hash(path.join(root, 'index.html')) !== report.bundle) throw new Error('Bundle changed');
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ out, bundle: report.bundle, captures: report.results.map(r => ({
    theme: r.theme, targetX: r.targetX, count: r.captures.length
  })) }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });

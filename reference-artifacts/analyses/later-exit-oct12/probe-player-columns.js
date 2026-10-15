const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { ROOT, withHarnessPage } = require('../../tools/harness/browser-check-util');

async function main() {
  const root = path.resolve(process.argv[2] || path.join(ROOT, 'dist/dev'));
  const output = path.resolve(process.argv[3] || path.join(__dirname, 'baseline-columns.json'));
  const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const report = { bundle: hash(path.join(root, 'index.html')), methodHash: hash(__filename),
    method: 'Normal human launch and arrow-key hold until a sampled column, then coast without firing. No position assignment. Controlled game steps; wall-clock key timing is not fixed.',
    limitations: ['A few reachable columns do not cover every human trajectory.', 'No perfect-route or reference-fidelity claim.'], results: [] };
  for (const stage of [31, 35, 39]) {
    for (const targetX of [60, 250]) {
      report.results.push(await withHarnessPage({ root, skipStart: true }, async ({ page }) => page.evaluate(({ stage, targetX }) => {
        const h = window.__galagaHarness__;
        h.start({ controlledClock: true, stageMode: 'display', startKind: 'challenge',
          stage, challengeStage: (stage + 1) / 4, seed: 9100 + stage, ships: 3,
          persona: null, expertPlays: 'human', autoVideo: false });
        const code = targetX < 140 ? 'ArrowLeft' : 'ArrowRight';
        window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true }));
        let held = true, settledX = null, release = null;
        const contacts = new Map();
        for (let frame = 0; frame < 3600; frame++) {
          h.advanceFor(1 / 60, { step: 1 / 60, stopOnGameOver: false });
          const s = h.snapshot();
          if (held && (targetX < 140 ? s.player.x <= targetX + 4 : s.player.x >= targetX - 4)) {
            window.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true }));
            held = false;
            release = { frame, x: s.player.x, t: s.simT };
          }
          if (!held && s.simT > 3) settledX = s.player.x;
          for (const event of h.recentEvents({ count: 300 })) {
            if (event.type === 'challenge_enemy_contact' && !contacts.has(event.id)) {
              contacts.set(event.id, { event, diagnostic: h.challengeContactDiagnostics(event.id) });
            }
          }
          if (!h.challengeFormationState().enemies.length) {
            if (held) window.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true }));
            return { stage, targetX, settledX, release, contacts: [...contacts.values()], final: s };
          }
        }
        throw new Error('Challenge did not complete');
      }, { stage, targetX })));
    }
  }
  if (hash(path.join(root, 'index.html')) !== report.bundle) throw new Error('Bundle changed during probe');
  fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ output, bundle: report.bundle, results: report.results.map(r => ({
    stage: r.stage, targetX: r.targetX, settledX: r.settledX,
    contacts: r.contacts.map(c => ({ id: c.event.id, t: c.event.t, phase: c.diagnostic?.phase }))
  })) }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });

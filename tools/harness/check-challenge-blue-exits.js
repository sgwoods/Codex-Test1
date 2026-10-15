#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { ROOT, withHarnessPage } = require('./browser-check-util');

async function main() {
  const args = process.argv.slice(2);
  const value = (name, fallback) => args.find(arg => arg.startsWith(`--${name}=`))?.slice(name.length + 3) || fallback;
  const root = path.resolve(value('root', path.join(ROOT, 'dist/dev')));
  const out = path.resolve(value('out', '/tmp/challenge-blue-exits.json'));
  const stages = value('stages', '31,35,39,63,127').split(',').map(Number);
  if (stages.some(stage => ![31,35,39,63,127].includes(stage))) throw new Error('Unsupported stage matrix');
  const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const report = { bundleHash: hash(path.join(root, 'index.html')), methodHash: hash(__filename), results: [],
    method: '60Hz controlled human/no-fire launch; normal arrow acceleration/braking; both resolved themes; full lifecycle.',
    limits: ['Fixed stage seeds and five sampled columns, not all positions or perfect feasibility.',
      'Sprite two-pose bounds are conservative estimates, not per-pixel intersection masks.',
      '12px/frame continuity and 0.4s empty-tail ceilings are engineering limits, not original-game measurements.'] };
  const save = () => {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
  };
  for (const theme of ['aurora-crown', 'classic-arcade']) for (const stage of stages) {
    for (const column of stage <= 39 ? [140,60,100,180,250] : [140]) {
      const result = await withHarnessPage({ root, skipStart: true }, async ({ page }) => {
        await page.clock.install({ time: new Date('2026-10-13T00:00:00Z') });
        await page.clock.pauseAt(new Date('2026-10-13T00:00:01Z'));
        return page.evaluate(({ theme, stage, column }) => {
          const h = window.__galagaHarness__;
          h.start({ controlledClock: true, stageMode: 'display', startKind: 'challenge', stage,
            challengeStage: (stage + 1) / 4, seed: 9100 + stage, ships: 3, persona: null,
            expertPlays: 'human', playerTwo: false, autoVideo: false, graphicsTheme: theme });
          const targets = new Map(h.challengeFormationState().enemies.map(e => [e.id, {
            id: e.id, blue: e.pathFamily === 'blue-purple-finale', wave: e.wave,
            bounds: h.challengeSpriteBounds(e.id), full: false, previous: null,
            joinStep: null, maxExitStep: 0, rowRiskSamples: 0, fullSamples: 0
          }]));
          const events = new Map(), code = column < 140 ? 'ArrowLeft' : 'ArrowRight';
          let held = column !== 140, lastVisible = null, settledX = null, final;
          let maxEnemyBullets = 0, maxPlayerBullets = 0, maxAttackers = 0;
          if (held) window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true }));
          for (let frame = 0; frame < 3600; frame++) {
            h.advanceFor(1 / 60, { step: 1 / 60, stopOnGameOver: false });
            final = h.snapshot();
            if (held && (column < 140 ? final.player.x <= column + 4 : final.player.x >= column - 4)) {
              window.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true }));
              held = false;
            }
            if (!held && final.simT > 3) settledX = final.player.x;
            for (const e of h.recentEvents({ count: 300 })) events.set(JSON.stringify(e), e);
            if (final.stage !== stage) {
              if (final.stageClock > 0.1) break;
              continue;
            }
            maxEnemyBullets = Math.max(maxEnemyBullets, final.counts.enemyBullets);
            maxPlayerBullets = Math.max(maxPlayerBullets, final.counts.playerBullets);
            maxAttackers = Math.max(maxAttackers, final.counts.attackers);
            for (const e of h.challengeFormationState().enemies) {
              if (e.spawn > 0) continue;
              const target = targets.get(e.id), b = target.bounds, x = Math.round(e.x), y = Math.round(e.y);
              const visible = x + b.right >= 0 && x + b.left <= 280 && y + b.bottom >= 0 && y + b.top <= 360;
              const full = x + b.left >= 0 && x + b.right <= 280 && y + b.top >= 0 && y + b.bottom <= 360;
              if (visible) lastVisible = final.simT;
              target.full ||= full;
              if (full) target.fullSamples++;
              if (!target.blue) continue;
              const d = h.challengeContactDiagnostics(e.id);
              if (![e.x,e.y,d.u].every(Number.isFinite)) throw new Error('Nonfinite blue pose');
              if (d.u >= 9.7 && target.previous) {
                const step = Math.hypot(e.x - target.previous.x, e.y - target.previous.y);
                if (target.previous.u < 9.7) target.joinStep = step;
                target.maxExitStep = Math.max(target.maxExitStep, step);
              }
              if (visible && x + b.right >= 2.6 && x + b.left <= 277.4 && y + b.bottom >= 323.6 && y + b.top <= 346.4) target.rowRiskSamples++;
              target.previous = { x: e.x, y: e.y, u: d.u, visible };
            }
          }
          if (held) window.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true }));
          const recorded = [...events.values()];
          const clear = recorded.find(e => e.type === 'challenge_clear' && e.stage === stage);
          const spawn = recorded.find(e => e.type === 'stage_spawn' && e.stage === stage + 1);
          return { stage, theme, column, settledX, resolvedTheme: h.state().visualAtmosphere?.overrideThemeId,
            targetCount: targets.size, fullEntries: [...targets.values()].filter(t => t.full).length,
            blue: [...targets.values()].filter(t => t.blue).map(t => ({ id: t.id, wave: t.wave,
              joinStep: t.joinStep, maxExitStep: t.maxExitStep, rowRiskSamples: t.rowRiskSamples,
              fullSeconds: t.fullSamples / 60, lastPose: t.previous })),
            contacts: recorded.filter(e => e.type === 'challenge_enemy_contact' && targets.get(e.id)?.blue),
            playerShots: recorded.filter(e => e.type === 'player_shot').length,
            maxEnemyBullets, maxPlayerBullets, maxAttackers, lives: final.lives, nextStage: final.stage,
            clear: clear?.t ?? null, spawn: spawn?.t ?? null, lastVisible,
            emptyTail: clear && lastVisible !== null ? clear.t - lastVisible : null,
            cadence: clear && spawn ? spawn.t - clear.t : null };
        }, { theme, stage, column });
      });
      const errors = [];
      if (result.resolvedTheme !== theme) errors.push('Resolved theme mismatch');
      if (result.targetCount !== 40 || result.fullEntries !== 40 || result.blue.length !== 24) errors.push('Target entry/count changed');
      if (result.contacts.length) errors.push('Blue contact requires repair or rendered disposition');
      if (!result.blue.some(t => t.joinStep !== null) || result.blue.some(t => (t.joinStep === null && (!t.lastPose || t.lastPose.visible)) || t.joinStep > 12 || t.maxExitStep > 12)) errors.push('Blue exit continuity exceeds budget or lacks offscreen departure');
      if (result.playerShots || result.maxPlayerBullets || result.maxEnemyBullets || result.maxAttackers || result.lives !== 3) errors.push('No-fire/combat safety changed');
      if (result.nextStage !== stage + 1 || result.clear === null || result.spawn === null) errors.push('Natural progression failed');
      if (result.emptyTail === null || result.emptyTail < 0 || result.emptyTail > 0.4) errors.push('Empty wait exceeds budget');
      if (result.cadence === null || Math.abs(result.cadence - 4.401) > 0.1) errors.push('Spawn cadence changed');
      report.results.push({ ...result, errors });
      save();
    }
  }
  if (hash(path.join(root, 'index.html')) !== report.bundleHash) throw new Error('Artifact changed during check');
  report.pass = report.results.every(result => result.errors.length === 0);
  save();
  console.log(JSON.stringify({ out, bundleHash: report.bundleHash, pass: report.pass,
    cases: report.results.length, failures: report.results.filter(r => r.errors.length).map(r => ({
      stage: r.stage, theme: r.theme, column: r.column, contacts: r.contacts.length, errors: r.errors })) }));
  if (!report.pass) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });

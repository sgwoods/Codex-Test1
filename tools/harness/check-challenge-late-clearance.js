#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { ROOT, withHarnessPage } = require('./browser-check-util');

function options(args) {
  const value = name => args.find(arg => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
  return { root: path.resolve(value('root') || path.join(ROOT, 'dist/dev')),
    out: value('out') ? path.resolve(value('out')) : null };
}

async function main() {
  const { root, out } = options(process.argv.slice(2));
  const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const index = path.join(root, 'index.html');
  const report = { bundleHash: hash(index), methodHash: hash(__filename),
    method: 'Seeded human/no-fire challenge; 60Hz full lifecycle in two themes. Scoped bounds, contact events and later-green exit continuity; no runtime position assignment.',
    limits: ['One seed per stage; not proof of every input or perfect feasibility.',
      'Conservative unrotated sprite bounds, not exhaustive pixel masks.',
      'Blue exits and earlier stages are outside this clearance gate.'], results: [] };
  for (const theme of ['aurora-crown', 'classic-arcade']) {
    for (const stage of [31, 35, 39, 63, 127]) {
      const result = await withHarnessPage({ root, skipStart: true }, async ({ page }) => page.evaluate(({ stage, theme }) => {
        const h = window.__galagaHarness__;
        h.start({ controlledClock: true, stageMode: 'display', startKind: 'challenge',
          stage, challengeStage: (stage + 1) / 4, seed: 9100 + stage, ships: 3,
          persona: null, expertPlays: 'human', playerTwo: false, autoVideo: false,
          graphicsTheme: theme });
        const initial = h.snapshot();
        const resolvedTheme = h.state().visualAtmosphere?.overrideThemeId;
        const targets = new Map(h.challengeFormationState().enemies.map(e => [e.id, {
          id: e.id, scoped: ['green-ladder-split', 'yellow-diagonal-fan'].includes(e.pathFamily),
          green: e.pathFamily === 'green-ladder-split',
          bounds: h.challengeSpriteBounds(e.id), full: false,
          previous: null, joinStep: null, maxExitStep: 0
        }]));
        const events = new Map();
        let lastVisible = null, maxBullets = 0, maxPlayerBullets = 0, maxAttackers = 0;
        let minBodyGap = Infinity, minDrawGap = Infinity, final = initial;
        for (let frame = 0; frame < 3600; frame++) {
          h.advanceFor(1 / 60, { step: 1 / 60, stopOnGameOver: false });
          final = h.snapshot();
          for (const event of h.recentEvents({ count: 300 })) events.set(JSON.stringify(event), event);
          if (final.stage !== stage) {
            if (final.stageClock > 0.1) break;
            continue;
          }
          maxBullets = Math.max(maxBullets, final.counts.enemyBullets);
          maxPlayerBullets = Math.max(maxPlayerBullets, final.counts.playerBullets);
          maxAttackers = Math.max(maxAttackers, final.counts.attackers);
          for (const e of h.challengeFormationState().enemies) {
            if (e.spawn > 0) continue;
            const target = targets.get(e.id), b = target?.bounds;
            if (!b) throw new Error('Missing initial target bounds');
            const x = Math.round(e.x), y = Math.round(e.y);
            const d = target.scoped ? h.challengeContactDiagnostics(e.id) : null;
            if (stage >= 35 && target.green && d.u >= 9.7 && target.previous) {
              const step = Math.hypot(e.x - target.previous.x, e.y - target.previous.y);
              if (target.previous.u < 9.7) target.joinStep = step;
              target.maxExitStep = Math.max(target.maxExitStep, step);
            }
            const visible = x + b.right >= 0 && x + b.left <= 280 && y + b.bottom >= 0 && y + b.top <= 360;
            if (d) target.previous = { x: e.x, y: e.y, u: d.u, visible };
            if (visible) lastVisible = final.simT;
            target.full ||= x + b.left >= 0 && x + b.right <= 280 && y + b.top >= 0 && y + b.bottom <= 360;
            if (target.scoped && visible) {
              minBodyGap = Math.min(minBodyGap, d.player.y - d.playerHitbox.h - d.y - d.enemyHitbox.h);
              // This band is wider than the observed single-ship glyph.
              minDrawGap = Math.min(minDrawGap, d.player.y - 11.4 - y - b.bottom);
            }
          }
        }
        const recorded = [...events.values()];
        const clear = recorded.find(e => e.type === 'challenge_clear' && e.stage === stage);
        const spawn = recorded.find(e => e.type === 'stage_spawn' && e.stage === stage + 1);
        return { stage, theme, resolvedTheme, finalResolvedTheme: h.state().visualAtmosphere?.overrideThemeId,
          playerShots: recorded.filter(e => e.type === 'player_shot').length, maxPlayerBullets,
          initialCount: targets.size,
          fullEntries: [...targets.values()].filter(t => t.full).length,
          scopedCount: [...targets.values()].filter(t => t.scoped).length,
          greenExits: [...targets.values()].filter(t => t.green).map(t => ({
            id: t.id, joinStep: t.joinStep, maxExitStep: t.maxExitStep, lastPose: t.previous })),
          scopedContacts: recorded.filter(e => e.type === 'challenge_enemy_contact' && targets.get(e.id)?.scoped),
          minBodyGap, minDrawGap, maxBullets, maxAttackers, lives: final.lives,
          nextStage: final.stage, clear: clear?.t ?? null, spawn: spawn?.t ?? null, lastVisible,
          emptyTail: clear && lastVisible !== null ? clear.t - lastVisible : null,
          cadence: clear && spawn ? spawn.t - clear.t : null };
      }, { stage, theme }));
      const errors = [];
      if (result.resolvedTheme !== theme || result.finalResolvedTheme !== theme) errors.push('Resolved theme differs from request');
      if (result.playerShots || result.maxPlayerBullets) errors.push('No-fire run contains player firing');
      if (result.initialCount !== 40 || result.fullEntries !== 40 || result.scopedCount !== 16) errors.push('Target entry/count changed');
      if (result.scopedContacts.length || !(result.minBodyGap > 0) || !(result.minDrawGap > 0)) errors.push('Scoped target reaches ship row');
      // Engineering teleport guard at 60Hz, not an original-game speed measurement.
      if (stage >= 35 && (result.greenExits.length !== 8 || !result.greenExits.some(t => t.joinStep !== null) || result.greenExits.some(t =>
        (t.joinStep === null && (!t.lastPose || t.lastPose.visible)) || t.joinStep > 12 || t.maxExitStep > 12))) errors.push('Later-green exit continuity exceeds 12px per frame or lacks an offscreen departure');
      if (result.maxBullets || result.maxAttackers || result.lives !== 3) errors.push('Challenge combat safety changed');
      if (result.nextStage !== stage + 1 || result.clear === null || result.spawn === null) errors.push('Natural progression failed');
      if (result.emptyTail === null || result.emptyTail < 0 || result.emptyTail > 0.4) errors.push('Last-visible-to-clear delay exceeds 0.4s');
      if (result.cadence === null || Math.abs(result.cadence - 4.401) > 0.1) errors.push('Clear-to-spawn cadence outside reference tolerance');
      report.results.push({ ...result, errors });
    }
  }
  if (hash(index) !== report.bundleHash) throw new Error('Artifact changed during validation');
  report.pass = report.results.every(r => r.errors.length === 0);
  if (out) {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
  }
  console.log(JSON.stringify(report, null, 2));
  if (!report.pass) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });

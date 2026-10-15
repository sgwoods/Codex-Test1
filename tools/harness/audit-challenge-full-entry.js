#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { createHash } = require('crypto');
const { ROOT, withHarnessPage, ensureLaneBuildFresh } = require('./browser-check-util');
const { DIST_DEV } = require('../build/paths');

async function main(){
  execFileSync(process.execPath, [path.join(ROOT, 'tools/build/build-index.js')], { cwd: ROOT, stdio: 'pipe' });
  ensureLaneBuildFresh(DIST_DEV);
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
  const sha256 = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const sourceHashes = Object.fromEntries(fs.readdirSync(path.join(ROOT, 'src/js')).filter(f => f.endsWith('.js')).sort()
    .map(f => [`src/js/${f}`, sha256(path.join(ROOT, 'src/js', f))]));
  const methodHash = sha256(__filename);
  const bundleHash = sha256(path.join(DIST_DEV, 'index.html'));
  const stages = Array.from({ length: 10 }, (_, i) => 3 + i * 4);
  const out = path.join(ROOT, 'reference-artifacts/analyses/challenge-full-entry', `${new Date().toISOString().replace(/[:.]/g, '-')}-${commit.slice(0, 8)}`);
  fs.mkdirSync(out, { recursive: true });
  const captures = [];
  const results = [];
  for(const stage of stages){
    const result = await withHarnessPage({ stage, seed: 9100 + stage }, async ({ page }) => {
      return page.evaluate(stage => {
        const h = window.__galagaHarness__;
        h.setupChallengeMotionProfileTest({ stage });
        const initial = h.challengeFormationState();
        const tracks = new Map(initial.enemies.map(e => [e.id, {
          id: e.id, wave: e.wave, lane: e.lane, type: e.type, family: e.family,
          bounds: h.challengeSpriteBounds(e.id),
          fullFrames: 0, centerFrames: 0, longestFullFrames: 0, run: 0, maxSpeed: 0, samples: []
        }]));
        const dt = 1 / 60;
        let frames = 0;
        for(; frames < 3600; frames++){
          h.advanceFor(dt, { step: dt, stopOnGameOver: false });
          const formation = h.challengeFormationState();
          for(const e of formation.enemies){
            const row = tracks.get(e.id);
            if(row) row.lastState = { x: e.x, y: e.y, spawn: e.spawn, tm: e.tm, referenceLeadIn: e.referenceLeadIn };
          }
          for(const e of formation.enemies){
            const row = tracks.get(e.id);
            if(!row || (e.spawn > 0 && !e.referenceLeadIn)) continue;
            const b = row.bounds;
            if(!b) throw new Error('Missing rendered sprite bounds');
            const full = Math.round(e.x) + b.left >= 0 && Math.round(e.x) + b.right <= 280 &&
              Math.round(e.y) + b.top >= 0 && Math.round(e.y) + b.bottom <= 360;
            row.centerFrames += e.x >= 0 && e.x <= 280 && e.y >= 0 && e.y <= 360 ? 1 : 0;
            row.fullFrames += full ? 1 : 0;
            row.run = full ? row.run + 1 : 0;
            row.longestFullFrames = Math.max(row.longestFullFrames, row.run);
            if(row.previous) row.maxSpeed = Math.max(row.maxSpeed, Math.hypot(e.x - row.previous.x, e.y - row.previous.y) / dt);
            row.previous = { x: e.x, y: e.y };
            if(frames % 6 === 0) row.samples.push({ t: +(frames * dt).toFixed(3), x: e.x, y: e.y, full });
          }
          if(!formation.enemies.length) break;
        }
        const targets = [...tracks.values()].map(({ previous, run, ...row }) => ({
          ...row, fullSeconds: +(row.fullFrames / 60).toFixed(3),
          longestFullSeconds: +(row.longestFullFrames / 60).toFixed(3), maxSpeed: +row.maxSpeed.toFixed(1)
        }));
        return { stage, challenge: (stage + 1) / 4, completed: frames < 3600,
          expectedTargets: targets.length, neverFullyEntered: targets.filter(e => !e.fullFrames).map(e => e.id),
          neverCenterEntered: targets.filter(e => !e.centerFrames).map(e => e.id),
          minContinuousFullSeconds: Math.min(...targets.map(e => e.longestFullSeconds)), targets };
      }, stage);
    });
    results.push(result);
    console.log(JSON.stringify({ stage, neverFullyEntered: result.neverFullyEntered.length,
      minContinuousFullSeconds: result.minContinuousFullSeconds }));
  }
  for(const stage of [27, 31]){
    for(const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]){
      await withHarnessPage({ stage, seed: 9100 + stage, viewport }, async ({ page }) => {
        const errors = [];
        page.on('pageerror', err => errors.push(String(err.message)));
        await page.evaluate(stage => window.__galagaHarness__.setupChallengeMotionProfileTest({ stage }), stage);
        let previousTime = 0;
        for(const time of [1, 2, 3.2, 5]){
          await page.evaluate(delta => window.__galagaHarness__.advanceFor(delta, { step: 1 / 60, stopOnGameOver: false }), time - previousTime);
          previousTime = time;
          // advanceFor draws synchronously; allow browser presentation to settle.
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          const canvases = await page.evaluate(() => [...document.querySelectorAll('canvas')].filter(c => c.width && c.height).map(c => {
            const pixels = c.getContext('2d')?.getImageData(0, 0, c.width, c.height).data;
            let coloredPixels = 0;
            if(pixels) for(let i = 0; i < pixels.length; i += 4) if(pixels[i + 3] && Math.max(pixels[i], pixels[i + 1], pixels[i + 2]) > 40) coloredPixels++;
            const r = c.getBoundingClientRect();
            const style = getComputedStyle(c);
            return { width: c.width, height: c.height, coloredPixels,
              visible: r.width > 0 && r.height > 0 && r.right > 0 && r.bottom > 0 &&
                r.left < innerWidth && r.top < innerHeight && style.visibility !== 'hidden' &&
                style.display !== 'none' && +style.opacity > 0 };
          }));
          const file = `stage-${stage}-${viewport.width}px-${time}s.png`;
          await page.screenshot({ path: path.join(out, file), fullPage: true });
          captures.push({ stage, viewport, requestedSimulatedSeconds: time, file, canvases, errors: [...errors] });
        }
      });
    }
  }
  const report = { generatedAt: new Date().toISOString(), commit, sourceHashes, methodHash, bundleHash,
    build: JSON.parse(fs.readFileSync(path.join(DIST_DEV, 'build-info.json'), 'utf8')),
    method: '60Hz no-fire motion-profile probe including visible pre-spawn lead-in; union of drawn fillRect bounds for open/closed sprite poses, 280x360 playfield; persisted tracks at 10Hz.',
    limitations: ['Geometric entry is not proof of shot routeability or perceptual readability.',
      'Speed needs comparison with primary video tracks; it is not a conformance verdict.',
      'Visual smoke checks canvas visibility and nonblank buffers, not enemy pixels, occlusion, audio, or gameplay correctness. Error collection covers the capture phase, not startup.',
      'Motion-profile setup normalizes the initial spawn delay. Stage 7 is measured only, not tuned.'],
    visualSmokePassed: captures.every(c => !c.errors.length && c.canvases.some(v => v.visible && v.coloredPixels > 100)),
    captures,
    passed: results.every(r => r.completed && r.expectedTargets === 40 && !r.neverFullyEntered.length), results };
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ report: path.relative(ROOT, out), passed: report.passed, visualSmokePassed: report.visualSmokePassed }));
}
main().catch(err => { console.error(err); process.exitCode = 1; });

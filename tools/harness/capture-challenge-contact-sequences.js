#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { ROOT, withHarnessPage } = require('./browser-check-util');
const { DIST_DEV } = require('../build/paths');

async function main(){
  const stageArg = process.argv.slice(2).find(arg => arg.startsWith('--stages='));
  const stages = stageArg ? stageArg.slice('--stages='.length).split(',').map(Number) : [31];
  assert(stages.length && stages.every(stage => Number.isInteger(stage) && stage >= 3 && (stage + 1) % 4 === 0), 'Use --stages=35,39 with challenge stages');
  const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
  const build = JSON.parse(fs.readFileSync(path.join(DIST_DEV, 'build-info.json'), 'utf8'));
  assert.equal(build.commit, commit);
  const bundleHash = hash(path.join(DIST_DEV, 'index.html'));
  const sourceHashes = Object.fromEntries(['05-player-combat.js', '06-enemy-behavior.js', '90-harness.js'].map(file =>
    [file, hash(path.join(ROOT, 'src/js', file))]));
  const out = path.join(ROOT, 'reference-artifacts/analyses/challenge-contact-sequences',
    `${new Date().toISOString().replace(/[:.]/g, '-')}-${commit.slice(0, 8)}`);
  fs.mkdirSync(out, { recursive: true });
  const results = [];
  const discoveries = [];
  for(const stage of [...new Set(stages)]){
  for(const graphicsTheme of ['classic-arcade', 'aurora-crown']){
    const contacts = await withHarnessPage({ skipStart: true, stage }, async ({ page }) => page.evaluate(({ graphicsTheme, stage }) => {
      const h = window.__galagaHarness__, seen = new Set(), contacts = [];
      h.start({ controlledClock: true, stageMode: 'display', startKind: 'challenge',
        challengeStage: (stage + 1) / 4, stage, ships: 3, persona: null,
        expertPlays: 'human', autoVideo: false, seed: 9100 + stage, graphicsTheme });
      for(let frame = 0; frame < 3600; frame++){
        h.advanceFor(1 / 60, { step: 1 / 60, stopOnGameOver: false });
        for(const event of h.recentEvents({ count: 200 })){
          if(event.type !== 'challenge_enemy_contact' || seen.has(event.id))continue;
          seen.add(event.id);
          contacts.push({ stage, id: event.id, contactFrame: frame, event });
        }
        if(!h.challengeFormationState().enemies.length)return contacts;
      }
      throw new Error(`Stage ${stage} discovery did not complete`);
    }, { graphicsTheme, stage }));
    discoveries.push({ stage, graphicsTheme, contacts: contacts.length, completed: true });
    for(const cfg of contacts){
      const result = await withHarnessPage({ skipStart: true, stage: cfg.stage }, async ({ page }) => page.evaluate(cfg => {
        const h = window.__galagaHarness__;
        h.start({ controlledClock: true, stageMode: 'display', startKind: 'challenge',
          challengeStage: (cfg.stage + 1) / 4, stage: cfg.stage, ships: 3, persona: null,
          expertPlays: 'human', autoVideo: false, seed: 9100 + cfg.stage, graphicsTheme: cfg.graphicsTheme });
        const initial = h.snapshot(), visualAtmosphere = h.state().visualAtmosphere, captures = [];
        let firstContactFrame = null;
        if(visualAtmosphere.overrideThemeId !== cfg.graphicsTheme)throw new Error('Graphics theme did not resolve');
        for(let frame = 0; frame <= cfg.contactFrame + 8; frame++){
          h.advanceFor(1 / 60, { step: 1 / 60, stopOnGameOver: false });
          if(firstContactFrame === null && h.recentEvents({ count: 200 }).some(e => e.type === 'challenge_enemy_contact' && e.id === cfg.id))firstContactFrame = frame;
          const offset = frame - cfg.contactFrame;
          if(offset >= -4 && offset % 2 === 0){
            const diagnostic = h.challengeContactDiagnostics(cfg.id);
            if(!diagnostic || diagnostic.id !== cfg.id)throw new Error('Intended contact target is absent');
            if(offset === 0 && firstContactFrame !== cfg.contactFrame)throw new Error('First contact frame drifted');
            captures.push({ frame, offset, snapshot: h.snapshot(), diagnostic,
              png: document.getElementById('c').toDataURL('image/png') });
          }
        }
        return { ...cfg, initial, visualAtmosphere, firstContactFrame, captures, contacts: h.recentEvents({ count: 200 }).filter(e => e.type === 'challenge_enemy_contact') };
      }, { ...cfg, graphicsTheme }));
      for(const capture of result.captures){
        const file = `${graphicsTheme}-stage-${cfg.stage}-target-${cfg.id}-frame-${capture.frame}.png`;
        fs.writeFileSync(path.join(out, file), Buffer.from(capture.png.split(',')[1], 'base64'));
        delete capture.png;
        capture.file = file;
        capture.sha256 = hash(path.join(out, file));
      }
      results.push(result);
    }
  }
  }
  assert.equal(hash(path.join(DIST_DEV, 'index.html')), bundleHash, 'Bundle changed during capture');
  for(const [file, expected] of Object.entries(sourceHashes))assert.equal(hash(path.join(ROOT, 'src/js', file)), expected);
  const report = { commit, build, bundleHash, sourceHashes, methodHash: hash(__filename),
    stages, discoveries,
    method: 'Selected developer challenge launches, stationary/no-fire seed 9100+stage, 60Hz; discover current contacts, replay and capture frames -4 through +8 every two frames; assert event timing repeats.',
    limitations: ['One controlled-clock seed; not a hosted-clock equivalence or general release gate.',
      'Graphics selection is captured in snapshots; no automatic pixel-overlap or original-fidelity verdict.'], results };
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ out, sequences: results.length, captures: results.reduce((n,r) => n + r.captures.length, 0) }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });

#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const { ROOT, launchHarnessBrowser } = require('./browser-launch');
const { DIST_DEV } = require('../build/paths');

async function main(){
  const option = process.argv.slice(2).find(arg => arg.startsWith('--stages='));
  const stages = option ? option.slice('--stages='.length).split(',').map(Number) : [3];
  assert.ok(stages.length && stages.every(stage => Number.isInteger(stage) && stage >= 3 && stage <= 39 && stage % 4 === 3),
    'Stages must be challenge display stages 3,7,...,39');
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
  const hash = bytes => createHash('sha256').update(bytes).digest('hex');
  const bundleHash = hash(fs.readFileSync(path.join(DIST_DEV, 'index.html')));
  const browser = await launchHarnessBrowser();
  const results = [];
  let build;
  try{
    for(const stage of stages)for(const cue of ['challengePerfect', 'challengeResults']){
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(() => {
        window.__resultAudioSources = [];
        const proto = AudioBufferSourceNode.prototype;
        const start = proto.start;
        const stop = proto.stop;
        proto.start = function(...args){
          if(['challengePerfect', 'challengeResults'].includes(this.__cue)){
            const record = {
              cue: this.__cue,
              startedAt: this.context.currentTime,
              duration: args[2] ?? (this.buffer.duration - (args[1] || 0)),
              stops: []
            };
            this.__resultProbe = record;
            window.__resultAudioSources.push(record);
            this.addEventListener('ended', () => {
              record.played = this.context.currentTime - record.startedAt;
            }, { once: true });
          }
          return start.apply(this, args);
        };
        proto.stop = function(...args){
          if(this.__resultProbe)this.__resultProbe.stops.push(this.context.currentTime);
          return stop.apply(this, args);
        };
      });
      await page.goto('http://localhost:8000/', { waitUntil: 'networkidle' });
      build = await page.evaluate(() => fetch('build-info.json').then(response => response.json()));
      assert.equal(build.commit, commit, 'Localhost serves a different source commit');
      const served = await page.request.get('http://localhost:8000/index.html');
      assert.equal(hash(await served.body()), bundleHash, 'Localhost bundle differs from the measured artifact');
      await page.evaluate(stage => window.__galagaHarness__.start({
        stage, challenge: true, ships: 3, autoVideo: false,
        audioTheme: 'galaga-reference-assets'
      }), stage);
      await page.evaluate(name => window.__galagaHarness__.triggerAudioCue(name, {
        phase: 'challenge', challenge: true, force: true
      }), cue);
      await page.waitForFunction(() => window.__resultAudioSources.length > 0);
      // Reproduce queue-time cleanup while the result phrase is playing.
      await page.waitForTimeout(1100);
      await page.evaluate(stage => window.__galagaHarness__.setupStageTransitionProbe({
        stage, mode: 'challengeResult', challenge: true
      }), stage);
      await page.waitForFunction(() => window.__resultAudioSources[0].played !== undefined);
      const record = await page.evaluate(() => window.__resultAudioSources[0]);
      await page.waitForFunction(stage => window.__galagaHarness__.state().stage === stage + 1, stage);
      const state = await page.evaluate(() => window.__galagaHarness__.state());
      assert.equal(record.stops.length, 0, `${cue} was explicitly stopped`);
      assert.equal(record.cue, cue, 'A different result cue was measured');
      assert.ok(Math.abs(record.duration - 4) < 0.01, 'Canonical phrase is not four seconds');
      assert.ok(record.played >= record.duration - 0.1, `${cue} ended early`);
      assert.equal(state.stage, stage + 1, 'Next stage did not spawn after the result handoff');
      assert.deepEqual(errors, [], 'Localhost reported page errors');
      results.push({ ...record, fromStage: stage, stage: state.stage });
      await page.close();
    }
  }finally{
    await browser.close();
  }
  assert.equal(hash(fs.readFileSync(path.join(DIST_DEV, 'index.html'))), bundleHash, 'Bundle changed during audio checks');
  const out = path.join(ROOT, 'reference-artifacts/analyses/challenge-result-audio-continuity',
    `${new Date().toISOString().replace(/[:.]/g, '-')}-${commit.slice(0, 8)}`);
  fs.mkdirSync(out, { recursive: true });
  const report = { ok: true, commit, build, stages, bundleHash,
    methodHash: createHash('sha256').update(fs.readFileSync(__filename)).digest('hex'),
    generatedAt: new Date().toISOString(),
    scope: 'Actual Web Audio source completion across normal queue and transition; entire archived four-second clips, not perceptual mix acceptance or challenge-only watch mode',
    limitations: ['Forced cue/transition probes, not natural ordinary/perfect outcomes.',
      'Private canonical assets on development localhost, not public packaged audio or perceptual audibility.'], results };
  fs.writeFileSync(path.join(out, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ ...report, out }, null, 2));
}

main().catch(error => { console.error(error); process.exitCode = 1; });

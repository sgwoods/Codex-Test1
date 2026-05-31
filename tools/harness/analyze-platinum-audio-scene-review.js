#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { gameConfig } = require('./audio-conformance-games');
const {
  extractRuntimeSceneAudio,
  readCaptureReport,
  renderRuntimePreview,
  resolveAnchorTime,
  sceneEventSummary
} = require('./lib/platinum-audio-scene-live-mix');
const { rel, rounded, writeJson } = require('./lib/platinum-audio-conformance');

const ROOT = path.resolve(__dirname, '..', '..');

function argValue(name, fallback){
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

function markdown(config, artifact){
  const lines = [
    `# ${config.gameLabel} Audio Scene Review`,
    '',
    'This report is generated from the reusable Platinum audio scene-review layer. It organizes gameplay sound by lived scene, not only by isolated cue.',
    '',
    `Scene count: **${artifact.summary.sceneCount}**`,
    '',
    '| Scene | Capture | Runtime window | Cue events | Target read |',
    '| --- | --- | --- | ---: | --- |'
  ];
  for(const scene of artifact.scenes){
    lines.push(`| ${scene.title} | \`${scene.captureLabel}\` | ${scene.runtime.startSeconds}s-${scene.runtime.endSeconds}s | ${scene.runtime.eventSummary.cueEventCount} | ${scene.targetRead} |`);
  }
  lines.push('', '## Next Use', '', artifact.nextUse, '');
  return `${lines.join('\n')}\n`;
}

function main(){
  const config = gameConfig(argValue('--game', 'galaxy-guardians-preview'));
  const sceneConfig = config.audioSceneReview || {};
  const scenes = [];
  const captureLabels = new Set();
  for(const definition of sceneConfig.scenes || []){
    const { report } = readCaptureReport(ROOT, config, definition.captureLabel);
    captureLabels.add(definition.captureLabel);
    const startSeconds = resolveAnchorTime(report, definition.runtimeStart, 0);
    const fallbackEnd = Math.min(
      +(report.capture?.seconds || 0) || 0,
      startSeconds + (Number.isFinite(+definition.runtimeDurationSeconds) ? +definition.runtimeDurationSeconds : 1.2)
    );
    const rawEnd = resolveAnchorTime(
      report,
      definition.runtimeEnd,
      fallbackEnd || startSeconds + 1.2,
      { minSeconds: startSeconds }
    );
    const endSeconds = Math.max(startSeconds + 0.08, Math.min(rawEnd, +(report.capture?.seconds || rawEnd)));
    const runtimeAudio = extractRuntimeSceneAudio(ROOT, report, startSeconds, endSeconds);
    const preview = renderRuntimePreview(ROOT, sceneConfig.previewDir, definition.id, runtimeAudio);
    scenes.push({
      id: definition.id,
      title: definition.title,
      captureLabel: definition.captureLabel,
      captureReport: rel(ROOT, path.join(ROOT, config.captureDir, `latest-${definition.captureLabel}.json`)),
      targetRead: definition.targetRead,
      reference: definition.reference,
      runtime: {
        startSeconds: rounded(startSeconds),
        endSeconds: rounded(endSeconds),
        durationSeconds: rounded(endSeconds - startSeconds),
        waveform: preview.waveform,
        spectrogram: preview.spectrogram,
        metrics: runtimeAudio.metrics,
        eventSummary: sceneEventSummary(report, startSeconds, endSeconds)
      }
    });
  }

  const artifact = {
    gameKey: config.gameKey,
    gameLabel: config.gameLabel,
    artifactType: 'platinum-audio-scene-review',
    version: '0.1-dev-preview',
    createdOn: '2026-05-31',
    status: 'runtime-scene-audio-review',
    generatedBy: 'tools/harness/analyze-platinum-audio-scene-review.js',
    sourceEvidence: {
      gameplayCaptureDir: config.captureDir,
      scenePlan: 'GUARDIANS_AUDIO_CONFORMANCE_SPRINT_PLAN_2026-05-31.md',
      note: 'This artifact persists target gameplay sound scenes so tuning and headed listening can compare lived windows instead of isolated cues only.'
    },
    summary: {
      sceneCount: scenes.length,
      captureLabels: Array.from(captureLabels),
      weakestByCueDensity: scenes.slice().sort((a, b) => a.runtime.eventSummary.cueEventCount - b.runtime.eventSummary.cueEventCount)[0]?.id || '',
      strongestByCueDensity: scenes.slice().sort((a, b) => b.runtime.eventSummary.cueEventCount - a.runtime.eventSummary.cueEventCount)[0]?.id || '',
      reusablePlatformRead: 'The scene-review layer is game-configured and can be extended for a third Platinum game by registering capture labels and scene anchors.'
    },
    scenes,
    nextUse: 'Listen scene by scene against the promoted reference windows, then retune only the cue families and cadence points that fail the lived-scene read.'
  };

  writeJson(path.join(ROOT, sceneConfig.artifactPath), artifact);
  fs.writeFileSync(path.join(ROOT, sceneConfig.reportPath), markdown(config, artifact));
  console.log(JSON.stringify({
    ok: true,
    artifact: sceneConfig.artifactPath,
    report: sceneConfig.reportPath,
    sceneCount: artifact.summary.sceneCount,
    weakestByCueDensity: artifact.summary.weakestByCueDensity
  }, null, 2));
}

try{
  main();
}catch(err){
  console.error(err && err.stack || String(err));
  if(err?.payload) console.error(JSON.stringify(err.payload, null, 2));
  process.exit(1);
}

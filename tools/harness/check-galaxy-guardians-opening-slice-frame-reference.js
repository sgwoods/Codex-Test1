#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(
  ROOT,
  'reference-artifacts',
  'analyses',
  'galaxy-guardians-identity',
  'opening-slice-frame-reference-0.1.json'
);
const FRAME_SUMMARY = path.join(
  ROOT,
  'reference-artifacts',
  'analyses',
  'galaxian-frame-reference',
  'frame-reference-summary.json'
);
const DOC = path.join(ROOT, 'GALAXY_GUARDIANS_OPENING_SLICE_BASELINE.md');
const RESUME = path.join(ROOT, 'GALAXY_GUARDIANS_RESUME_STATE_AND_NEXT_STEPS.md');
const PROJECT_GUIDE = path.join(ROOT, 'project-guide.json');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function read(file){
  return fs.readFileSync(file, 'utf8');
}

function readJson(file){
  return JSON.parse(read(file));
}

function includesAll(source, required){
  return required.filter(item => !source.includes(item));
}

function exists(relPath){
  return fs.existsSync(path.join(ROOT, relPath));
}

function buildWindowLookup(summary){
  const windows = new Map();
  for(const source of summary.sources || []){
    for(const window of source.windows || []){
      windows.set(`${source.sourceId}:${window.id}`, window);
    }
  }
  return windows;
}

function nearestFrame(frames, tSourceSeconds, sampledFps){
  const toleranceSeconds = 1 / Math.max(1, sampledFps);
  let best = null;
  let bestDistance = Infinity;
  for(const frame of frames){
    const distance = Math.abs((+frame.tSourceSeconds || 0) - tSourceSeconds);
    if(distance < bestDistance){
      best = frame;
      bestDistance = distance;
    }
  }
  if(!best || bestDistance > toleranceSeconds){
    return null;
  }
  return { frame: best, distanceSeconds: bestDistance };
}

function main(){
  const artifact = readJson(ARTIFACT);
  const summary = readJson(FRAME_SUMMARY);
  const doc = read(DOC);
  const resume = read(RESUME);
  const projectGuide = readJson(PROJECT_GUIDE);
  const windows = buildWindowLookup(summary);

  if(artifact.gameKey !== 'galaxy-guardians-preview'){
    fail('Opening-slice frame reference is attached to the wrong game.', { gameKey: artifact.gameKey });
  }
  if(artifact.status !== 'promoted-frame-window-opening-authority'){
    fail('Opening-slice frame reference has an unexpected status.', { status: artifact.status });
  }
  if(artifact.frameReferenceSummary !== 'reference-artifacts/analyses/galaxian-frame-reference/frame-reference-summary.json'){
    fail('Opening-slice frame reference does not point at the promoted frame-reference summary.', {
      frameReferenceSummary: artifact.frameReferenceSummary
    });
  }

  const requiredWindows = [
    ['attractMissionText', 'matt-hawkins-arcade-intro', 'attract-mission-text'],
    ['scoreAdvanceTable', 'matt-hawkins-arcade-intro', 'score-advance-table'],
    ['wrapReturnPressure', 'nenriki-15-wave-session', 'wrap-return-pressure']
  ];
  const missing = [];
  for(const [key, sourceId, windowId] of requiredWindows){
    const window = artifact.sourceWindows?.[key];
    if(!window){
      missing.push(`${key}:artifact`);
      continue;
    }
    if(window.sourceId !== sourceId) missing.push(`${key}:sourceId`);
    if(window.windowId !== windowId) missing.push(`${key}:windowId`);
    const promotedWindow = windows.get(`${sourceId}:${windowId}`);
    if(!promotedWindow){
      missing.push(`${key}:promotedWindow`);
      continue;
    }
    for(const relPath of [
      window.frameIndex,
      window.contactSheet,
      window.motionDifferenceSheet,
      window.waveform,
      window.spectrogram
    ]){
      if(!exists(relPath)){
        missing.push(`${key}:${relPath}`);
      }
    }

    const frameIndex = readJson(path.join(ROOT, window.frameIndex));
    const frames = frameIndex.frames || [];
    for(const point of window.sampleReadPoints || []){
      const match = nearestFrame(frames, +point.tSourceSeconds || 0, +window.sampledFps || +promotedWindow.sampledFps || 1);
      if(!match){
        missing.push(`${key}:sample:${point.label}`);
        continue;
      }
      if(!exists(match.frame.file)){
        missing.push(`${key}:sampleFile:${match.frame.file}`);
      }
    }
  }
  if(missing.length){
    fail('Opening-slice frame reference is missing promoted windows, artifacts, or representative samples.', { missing });
  }

  const attractPhrases = artifact.sourceWindows?.attractMissionText?.canonicalPhrases || [];
  const scorePhrases = artifact.sourceWindows?.scoreAdvanceTable?.canonicalPhrases || [];
  const missingDocText = includesAll(doc, [
    'frame-reference',
    'attract mission text',
    'score advance table',
    'wrap-return pressure',
    ...attractPhrases,
    ...scorePhrases
  ]);
  if(missingDocText.length){
    fail('Opening baseline doc is missing required frame-reference language.', { missingDocText });
  }

  const missingResumeText = includesAll(resume, [
    'promoted frame windows',
    'Matt Hawkins',
    'Nenriki',
    'top-reentry'
  ]);
  if(missingResumeText.length){
    fail('Resume note is missing required frame-reference progress language.', { missingResumeText });
  }

  const guideSource = JSON.stringify(projectGuide);
  const missingGuideText = includesAll(guideSource, [
    'promoted frame windows',
    'Read Opening Baseline',
    'WAIT',
    'score-table layout'
  ]);
  if(missingGuideText.length){
    fail('Project guide is missing required frame-reference queue language.', { missingGuideText });
  }

  console.log(JSON.stringify({
    ok: true,
    artifact: path.relative(ROOT, ARTIFACT),
    checkedWindows: requiredWindows.map(([key]) => key),
    nextPromotionWork: artifact.nextPromotionWork
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}

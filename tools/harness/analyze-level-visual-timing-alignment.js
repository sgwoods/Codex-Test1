#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const OUT_ROOT = path.join(ANALYSES, 'level-visual-timing-alignment');
const TARGET_VIDEO_DIR = path.join(OUT_ROOT, 'latest-target-videos');
const CURRENT_VIDEO_DIR = path.join(OUT_ROOT, 'latest-current-videos');
const PAIRED_VIDEO_DIR = path.join(OUT_ROOT, 'latest-paired-videos');
const CONTACT_DIR = path.join(OUT_ROOT, 'latest-contact-sheets');
const TEMP_FRAME_DIR = path.join(OUT_ROOT, '.tmp-current-frames');
const LATEST_JSON = path.join(OUT_ROOT, 'latest.json');
const TOP_LEVEL_MD = path.join(ROOT, 'LEVEL_VISUAL_TIMING_ALIGNMENT.md');

const CHALLENGE_REF = path.join(ANALYSES, 'galaga-challenge-video-reference', 'latest.json');
const CHALLENGE_TRAJECTORY_CONTROLS = path.join(ANALYSES, 'challenge-trajectory-controls', 'latest.json');
const CHALLENGE_MARKERS = [3, 7, 11, 15, 19, 23, 27, 31];
const CHALLENGE_ALL_SOURCE = '/Users/sgwoods/Downloads/challenge-all2.mp4';
const DEFAULT_CHALLENGE_SET = Object.freeze([1, 2, 3, 4]);
const REPRESENTATIVE_CHALLENGE_SET = Object.freeze([1, 3, 8]);
const CURRENT_FPS = 10;
const TARGET_FPS = 24;
const MAX_CAPTURE_SECONDS = 42;

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function readJson(file, fallback = null){
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${String(value).replace(/\r\n/g, '\n').trimEnd()}\n`);
}

function safeRemove(dir){
  if(!dir || !dir.startsWith(OUT_ROOT)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

function safeRemoveFile(file){
  if(!file || !file.startsWith(OUT_ROOT)) return;
  fs.rmSync(file, { force: true });
}

function cleanupStageOutputs(files = []){
  for(const file of files) safeRemoveFile(file);
}

function git(args, fallback = ''){
  try {
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return fallback;
  }
}

function round(value, digits = 2){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function parseArgs(){
  const out = {
    stages: [...DEFAULT_CHALLENGE_SET],
    selectionMode: 'default-first-four-challenges'
  };
  for(const arg of process.argv.slice(2)){
    if(arg === '--all'){
      out.stages = null;
      out.selectionMode = 'all-challenges';
      continue;
    }
    if(arg === '--representative'){
      out.stages = [...REPRESENTATIVE_CHALLENGE_SET];
      out.selectionMode = 'representative-challenges';
      continue;
    }
    const [key, raw = ''] = arg.split('=');
    if(key === '--stage' || key === '--challenge-stage'){
      const stage = Math.max(1, Math.min(8, +raw || 0));
      if(stage){
        out.stages = [stage];
        out.selectionMode = 'single-challenge';
      }
    }
    if(key === '--stages'){
      const stages = raw.split(',').map(value => +value).filter(value => value >= 1 && value <= 8);
      if(stages.length){
        out.stages = Array.from(new Set(stages));
        out.selectionMode = 'explicit-challenge-list';
      }
    }
  }
  return out;
}

function challengeLabel(challengeNumber){
  const marker = CHALLENGE_MARKERS[challengeNumber - 1] || (3 + (challengeNumber - 1) * 4);
  return `Challenging Stage ${Math.max(1, marker - 1)}-${marker}`;
}

function loadChallengeWindows(){
  const ref = readJson(CHALLENGE_REF, {});
  const rows = Array.isArray(ref.primaryWindows) ? ref.primaryWindows : [];
  return rows
    .filter(row => Number.isFinite(+row.challengeNumber))
    .sort((a, b) => +a.challengeNumber - +b.challengeNumber);
}

function loadTargetMotionTiming(challengeNumber){
  const controls = readJson(CHALLENGE_TRAJECTORY_CONTROLS, {});
  const challenge = (Array.isArray(controls.challenges) ? controls.challenges : [])
    .find(row => +row.challengeNumber === +challengeNumber);
  const groups = Array.isArray(challenge?.groups) ? challenge.groups : [];
  const starts = groups
    .map(group => +group.target?.visibleStartS)
    .filter(Number.isFinite);
  const ends = groups
    .map(group => +group.target?.visibleEndS)
    .filter(Number.isFinite);
  if(!starts.length || !ends.length) return null;
  return {
    source: rel(CHALLENGE_TRAJECTORY_CONTROLS),
    groupCount: groups.length,
    firstVisibleSecond: round(Math.min(...starts), 2),
    lastVisibleSecond: round(Math.max(...ends), 2),
    averageConfidence: round(challenge.averageConfidence, 3),
    controlReadiness10: round(challenge.controlReadiness10, 1)
  };
}

function sourceForWindow(windowRow){
  const source = windowRow.source || CHALLENGE_ALL_SOURCE;
  return fs.existsSync(source) ? source : '';
}

function runFfmpeg(args, label){
  const ffmpeg = process.env.FFMPEG || 'ffmpeg';
  const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { encoding: 'utf8' });
  if(result.status !== 0){
    throw new Error(`${label} failed: ${(result.stderr || result.stdout || 'ffmpeg failed').trim()}`);
  }
}

function extractTargetClip(windowRow, output, durationSeconds){
  const source = sourceForWindow(windowRow);
  if(!source) return { ok: false, status: 'target-source-missing', video: null };
  ensureDir(path.dirname(output));
  runFfmpeg([
    '-ss', String(round(windowRow.start || 0, 3)),
    '-i', source,
    '-t', String(durationSeconds),
    '-an',
    '-vf', `fps=${TARGET_FPS},scale=720:-2`,
    '-c:v', 'libvpx-vp9',
    '-b:v', '0',
    '-crf', '38',
    '-row-mt', '1',
    output
  ], `target clip ${windowRow.challengeNumber}`);
  return {
    ok: fs.existsSync(output),
    status: 'target-stage-start-window',
    video: fs.existsSync(output) ? rel(output) : null
  };
}

async function captureCurrentClip(windowRow, output, durationSeconds){
  const challengeNumber = +windowRow.challengeNumber;
  const marker = CHALLENGE_MARKERS[challengeNumber - 1] || (3 + (challengeNumber - 1) * 4);
  const frameDir = path.join(TEMP_FRAME_DIR, `challenge-${String(challengeNumber).padStart(2, '0')}`);
  safeRemove(frameDir);
  ensureDir(frameDir);
  ensureDir(path.dirname(output));
  const frameCount = Math.max(1, Math.round(durationSeconds * CURRENT_FPS));
  const samples = [];
  return withHarnessPage({
    skipStart: true,
    seed: 71000 + challengeNumber,
    viewport: { width: 960, height: 900 }
  }, async ({ page }) => {
    await page.evaluate(cfg => {
      localStorage.setItem('auroraGalacticaAutoVideo', '0');
      localStorage.setItem('platinumAutoVideo', '0');
      localStorage.setItem('auroraGameSoundVolume', '0');
      localStorage.setItem('platinumGameSoundVolume', '0');
      localStorage.setItem('auroraArcadeMusicMuted', '1');
      localStorage.setItem('platinumArcadeMusicMuted', '1');
      const h = window.__galagaHarness__;
      h.start({
        autoVideo: false,
        stageMode: 'display',
        startKind: 'challenge',
        challengeStage: cfg.challengeNumber,
        stage: cfg.marker,
        ships: 3,
        seed: cfg.seed,
        graphicsTheme: 'classic-arcade',
        spriteRenderMode: 'reference-pixel-lab',
        starfieldIntensity: 0,
        starfieldSpeed: 0
      });
      h.setControlledClock(true);
      h.redraw();
    }, { challengeNumber, marker, seed: 71000 + challengeNumber });

    let firstActiveEnemySecond = null;
    let lastActiveEnemySecond = null;
    let lastChallengeEnemySecond = null;
    let challengeEndedSecond = null;
    try {
      for(let index = 0; index < frameCount; index += 1){
        const second = index / CURRENT_FPS;
        const framePath = path.join(frameDir, `frame-${String(index).padStart(4, '0')}.png`);
        const sample = await page.evaluate(t => {
          const h = window.__galagaHarness__;
          const state = h.state();
          const runtime = h.spriteRuntimeState();
          const challenge = h.challengeFormationState();
          const challengeEnemies = Array.isArray(challenge?.enemies) ? challenge.enemies : [];
          const enteredChallengeEnemies = challengeEnemies.filter(enemy => +enemy.spawn <= 0);
          const canvas = document.getElementById('c');
          const width = canvas?.width || 260;
          const height = canvas?.height || 360;
          const visibleChallengeEnemies = challengeEnemies.filter(enemy => (
            +enemy.x >= -24 &&
            +enemy.x <= width + 24 &&
            +enemy.y >= -24 &&
            +enemy.y <= height + 24
          ));
          return {
            t: +t.toFixed(2),
            stage: state.stage,
            challenge: !!state.challenge,
            score: state.score,
            activeEnemyCount: Array.isArray(runtime?.enemies) ? runtime.enemies.length : 0,
            challengeEnemyCount: challengeEnemies.length,
            enteredChallengeEnemyCount: enteredChallengeEnemies.length,
            visibleChallengeEnemyCount: visibleChallengeEnemies.length,
            banner: state.bannerTxt || '',
            bannerMode: state.bannerMode || ''
          };
        }, second);
        if(index % CURRENT_FPS === 0) samples.push(sample);
        if(sample.visibleChallengeEnemyCount > 0){
          if(firstActiveEnemySecond === null) firstActiveEnemySecond = round(second, 2);
          lastActiveEnemySecond = round(second, 2);
        }
        if(sample.challengeEnemyCount > 0) lastChallengeEnemySecond = round(second, 2);
        if(challengeEndedSecond === null && sample.challenge === false && second > 2) challengeEndedSecond = round(second, 2);
        await page.locator('#c').screenshot({ path: framePath });
        await page.evaluate(stepSeconds => {
          const h = window.__galagaHarness__;
          h.advanceFor(stepSeconds, { step: 1 / 60, stopOnGameOver: false });
          h.redraw();
        }, 1 / CURRENT_FPS);
      }
      const frameFiles = fs.readdirSync(frameDir).filter(name => /^frame-\d+\.png$/.test(name));
      if(!frameFiles.length){
        return {
          ok: false,
          status: 'current-frame-sequence-missing',
          video: null,
          firstActiveEnemySecond,
          lastActiveEnemySecond,
          lastChallengeEnemySecond,
          challengeEndedSecond,
          samples,
          error: `No current frame sequence was captured for challenge ${challengeNumber} at ${frameDir}.`
        };
      }
      runFfmpeg([
        '-framerate', String(CURRENT_FPS),
        '-i', path.join(frameDir, 'frame-%04d.png'),
        '-t', String(durationSeconds),
        '-an',
        '-vf', 'scale=720:-2',
        '-c:v', 'libvpx-vp9',
        '-b:v', '0',
        '-crf', '36',
        '-row-mt', '1',
        output
      ], `current clip ${challengeNumber}`);
      return {
        ok: fs.existsSync(output),
        status: fs.existsSync(output) ? 'current-stage-start-controlled-clock-window' : 'current-video-missing-after-encode',
        video: fs.existsSync(output) ? rel(output) : null,
        firstActiveEnemySecond,
        lastActiveEnemySecond,
        lastChallengeEnemySecond,
        challengeEndedSecond,
        samples,
        error: fs.existsSync(output) ? null : `Current clip encode completed without producing ${output}.`
      };
    } finally {
      safeRemove(frameDir);
    }
  });
}

function buildPairedClip(row, targetVideo, currentVideo, output){
  if(!targetVideo || !currentVideo) return { ok: false, status: 'source-clips-missing', video: null };
  ensureDir(path.dirname(output));
  const targetAbs = path.join(ROOT, targetVideo);
  const currentAbs = path.join(ROOT, currentVideo);
  runFfmpeg([
    '-i', targetAbs,
    '-i', currentAbs,
    '-filter_complex',
    '[0:v]scale=720:540:force_original_aspect_ratio=decrease,pad=720:540:(ow-iw)/2:(oh-ih)/2:black,setpts=PTS-STARTPTS[target];[1:v]scale=720:540:force_original_aspect_ratio=decrease,pad=720:540:(ow-iw)/2:(oh-ih)/2:black,setpts=PTS-STARTPTS[current];[target][current]hstack=inputs=2[v]',
    '-map', '[v]',
    '-an',
    '-c:v', 'libvpx-vp9',
    '-b:v', '0',
    '-crf', '37',
    '-row-mt', '1',
    output
  ], `paired clip ${row.challengeNumber}`);
  return {
    ok: true,
    status: 'target-left-current-right-stage-start-aligned',
    video: rel(output)
  };
}

function buildContactSheet(row, pairedVideo, output, durationSeconds){
  if(!pairedVideo) return { ok: false, contactSheet: null, status: 'paired-video-missing' };
  ensureDir(path.dirname(output));
  const rows = Math.max(1, Math.ceil(Math.ceil(durationSeconds) / 4));
  runFfmpeg([
    '-i', path.join(ROOT, pairedVideo),
    '-vf', `fps=1,scale=360:-2,tile=4x${rows}:padding=6:margin=8:color=black`,
    '-frames:v', '1',
    output
  ], `contact sheet ${row.challengeNumber}`);
  return {
    ok: true,
    status: 'stage-start-paired-contact-sheet',
    contactSheet: rel(output)
  };
}

function syncRead(windowRow, current){
  const targetDuration = +windowRow.duration || 0;
  const targetMotion = loadTargetMotionTiming(windowRow.challengeNumber);
  const targetLastVisible = targetMotion?.lastVisibleSecond;
  const currentEnd = current.challengeEndedSecond;
  const activeStart = current.firstActiveEnemySecond;
  const visibleMotionEnd = current.lastActiveEnemySecond;
  const challengeEnemyEnd = current.lastChallengeEnemySecond;
  const drift = Number.isFinite(+currentEnd) ? round(currentEnd - targetDuration, 2) : null;
  const visibleMotionDrift = Number.isFinite(+visibleMotionEnd) ? round(visibleMotionEnd - targetDuration, 2) : null;
  const targetVisibleMotionDrift = Number.isFinite(+visibleMotionEnd) && Number.isFinite(+targetLastVisible)
    ? round(visibleMotionEnd - targetLastVisible, 2)
    : null;
  const challengeEnemyDrift = Number.isFinite(+challengeEnemyEnd) ? round(challengeEnemyEnd - targetDuration, 2) : null;
  const resultHold = Number.isFinite(+currentEnd) && Number.isFinite(+challengeEnemyEnd) ? round(currentEnd - challengeEnemyEnd, 2) : null;
  const targetResultHold = Number.isFinite(+targetLastVisible) ? round(targetDuration - targetLastVisible, 2) : null;
  const resultHoldDrift = Number.isFinite(+resultHold) && Number.isFinite(+targetResultHold)
    ? round(resultHold - targetResultHold, 2)
    : null;
  const activity = Number.isFinite(+activeStart)
    ? `Aurora first visible active enemies appear around ${activeStart}s after challenge start.`
    : 'Aurora first active enemy timing was not detected in the sampled timeline.';
  const visibleEnding = Number.isFinite(+visibleMotionEnd)
    ? `Last visible challenge enemy is sampled around ${visibleMotionEnd}s; target visible-motion drift is ${Number.isFinite(+targetVisibleMotionDrift) ? `${targetVisibleMotionDrift}s` : 'pending'}, while full-window drift is ${visibleMotionDrift}s.`
    : 'Aurora last visible challenge enemy timing was not detected in the sampled timeline.';
  const enemyEnding = Number.isFinite(+challengeEnemyEnd)
    ? `Last challenge enemy present is sampled around ${challengeEnemyEnd}s; enemy-presence drift versus target window is ${challengeEnemyDrift}s.`
    : 'Aurora last challenge enemy timing was not detected in the sampled timeline.';
  const ending = Number.isFinite(+currentEnd)
    ? `Aurora exits challenge state around ${currentEnd}s, versus target window ${targetDuration}s; drift ${drift}s.`
    : `Aurora did not exit challenge state inside the ${targetDuration}s aligned window.`;
  const ceremony = Number.isFinite(+resultHold)
    ? `Result-ceremony/empty-challenge hold after the last challenge enemy is about ${resultHold}s${Number.isFinite(+resultHoldDrift) ? `; target-result-hold drift is ${resultHoldDrift}s` : ''}.`
    : 'Result-ceremony/empty-challenge hold could not be measured.';
  return `${activity} ${visibleEnding} ${enemyEnding} ${ending} ${ceremony}`;
}

function buildMarkdown(report){
  const rows = report.rows || [];
  const failures = Array.isArray(report.failures) ? report.failures : [];
  const requested = report.summary?.requestedChallengeNumbers || [];
  const completed = report.summary?.completedChallengeNumbers || rows.map(row => row.challengeNumber);
  const failed = report.summary?.failedChallengeNumbers || failures.map(row => row.challengeNumber);
  const table = rows.map(row => `| ${row.challengeNumber} | ${row.label} | ${row.durationSeconds}s | ${row.targetLastVisibleEnemySecond ?? 'n/a'}s | ${row.currentLastVisibleEnemySecond ?? 'n/a'}s | ${row.currentVsTargetVisibleMotionEndDriftSeconds ?? 'n/a'}s | ${row.targetResultCeremonyHoldSeconds ?? 'n/a'}s | ${row.currentResultCeremonyHoldSeconds ?? 'n/a'}s | ${row.currentResultCeremonyHoldDriftSeconds ?? 'n/a'}s | ${row.currentChallengeEndedSecond ?? 'n/a'}s | ${row.currentVsTargetEndDriftSeconds ?? 'n/a'}s | \`${row.pairedVideo || 'pending'}\` |`).join('\n');
  const sections = rows.map(row => `## ${row.label}

**Aligned clip:** ${row.pairedVideo ? `\`${row.pairedVideo}\`` : 'pending'}

**Contact sheet:** ${row.contactSheet ? `\`${row.contactSheet}\`` : 'pending'}

**Read:** ${row.syncRead}

**Target source:** ${row.targetWindow.id}; starts at ${row.targetWindow.startSeconds}s for ${row.targetWindow.durationSeconds}s.

**Known limit:** ${row.knownLimit}
`).join('\n');
  const failureSection = failures.length ? `
## Capture Failures

These requested challenges did not produce complete target/current paired evidence. The checker treats any failure here as a blocked artifact so partial latest artifacts are not accidentally promoted.

| Challenge | Label | Target Window | Error |
| ---: | --- | --- | --- |
${failures.map(row => `| ${row.challengeNumber} | ${row.label} | ${row.targetWindow?.id || 'pending'} | ${String(row.error || 'unknown').replace(/\|/g, '\\|')} |`).join('\n')}
` : '';
  return `# Level Visual Timing Alignment

Generated: ${report.generatedAt}
Commit: ${report.commit}
Branch: ${report.branch}

## Summary

${report.summary.read}

Requested challenges: ${requested.join(', ') || 'n/a'}.
Completed challenges: ${completed.join(', ') || 'none'}.
Failed challenges: ${failed.join(', ') || 'none'}.
Selection mode: ${report.summary.selectionMode || 'unknown'}.

| Challenge | Label | Window Duration | Target Last Visible | Aurora Last Visible | Visible Drift | Target Result Hold | Aurora Result Hold | Result Hold Drift | Aurora Challenge End | End Drift | Paired Clip |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
${table}

${failureSection}

${sections}
`;
}

async function buildReport(){
  ensureDir(OUT_ROOT);
  safeRemove(TARGET_VIDEO_DIR);
  safeRemove(CURRENT_VIDEO_DIR);
  safeRemove(PAIRED_VIDEO_DIR);
  safeRemove(CONTACT_DIR);
  safeRemove(TEMP_FRAME_DIR);
  ensureDir(TARGET_VIDEO_DIR);
  ensureDir(CURRENT_VIDEO_DIR);
  ensureDir(PAIRED_VIDEO_DIR);
  ensureDir(CONTACT_DIR);

  const args = parseArgs();
  const windows = loadChallengeWindows()
    .filter(row => !args.stages || args.stages.includes(+row.challengeNumber));
  if(!windows.length) throw new Error('No challenge windows available for timing alignment.');

  const generatedAt = new Date().toISOString();
  const commit = git(['rev-parse', '--short', 'HEAD'], 'unknown');
  const branch = git(['branch', '--show-current'], 'unknown');
  const rows = [];
  const failures = [];
  for(const windowRow of windows){
    const challengeNumber = +windowRow.challengeNumber;
    const id = `challenge-${String(challengeNumber).padStart(2, '0')}`;
    const durationSeconds = Math.min(MAX_CAPTURE_SECONDS, Math.max(10, Math.ceil(+windowRow.duration || 30)));
    const targetOut = path.join(TARGET_VIDEO_DIR, `${id}.webm`);
    const currentOut = path.join(CURRENT_VIDEO_DIR, `${id}.webm`);
    const pairedOut = path.join(PAIRED_VIDEO_DIR, `${id}-target-vs-current-aligned.webm`);
    const contactOut = path.join(CONTACT_DIR, `${id}-target-vs-current-aligned-contact.jpg`);
    try {
      const target = extractTargetClip(windowRow, targetOut, durationSeconds);
      if(!target.ok) throw new Error(`Target clip unavailable for challenge ${challengeNumber}: ${target.status}`);
      const current = await captureCurrentClip(windowRow, currentOut, durationSeconds);
      if(!current.ok) throw new Error(current.error || `Current clip unavailable for challenge ${challengeNumber}: ${current.status}`);
      const paired = buildPairedClip(windowRow, target.video, current.video, pairedOut);
      if(!paired.ok) throw new Error(`Paired clip unavailable for challenge ${challengeNumber}: ${paired.status}`);
      const contact = buildContactSheet(windowRow, paired.video, contactOut, durationSeconds);
      if(!contact.ok) throw new Error(`Contact sheet unavailable for challenge ${challengeNumber}: ${contact.status}`);
      const targetDuration = +windowRow.duration || durationSeconds;
      const targetMotion = loadTargetMotionTiming(challengeNumber);
      const targetLastVisible = targetMotion?.lastVisibleSecond;
      const drift = Number.isFinite(+current.challengeEndedSecond) ? round(+current.challengeEndedSecond - targetDuration, 2) : null;
      const visibleMotionDrift = Number.isFinite(+current.lastActiveEnemySecond) ? round(+current.lastActiveEnemySecond - targetDuration, 2) : null;
      const targetVisibleMotionDrift = Number.isFinite(+current.lastActiveEnemySecond) && Number.isFinite(+targetLastVisible)
        ? round(+current.lastActiveEnemySecond - +targetLastVisible, 2)
        : null;
      const challengeEnemyDrift = Number.isFinite(+current.lastChallengeEnemySecond) ? round(+current.lastChallengeEnemySecond - targetDuration, 2) : null;
      const resultCeremonyHold = Number.isFinite(+current.challengeEndedSecond) && Number.isFinite(+current.lastChallengeEnemySecond)
        ? round(+current.challengeEndedSecond - +current.lastChallengeEnemySecond, 2)
        : null;
      const targetResultCeremonyHold = Number.isFinite(+targetLastVisible) ? round(targetDuration - +targetLastVisible, 2) : null;
      const resultCeremonyHoldDrift = Number.isFinite(+resultCeremonyHold) && Number.isFinite(+targetResultCeremonyHold)
        ? round(resultCeremonyHold - targetResultCeremonyHold, 2)
        : null;
      rows.push({
        challengeNumber,
        stageMarker: CHALLENGE_MARKERS[challengeNumber - 1] || null,
        id,
        label: challengeLabel(challengeNumber),
        durationSeconds,
        targetVideo: target.video,
        currentVideo: current.video,
        pairedVideo: paired.video,
        contactSheet: contact.contactSheet,
        currentFirstActiveEnemySecond: current.firstActiveEnemySecond,
        targetFirstVisibleEnemySecond: targetMotion?.firstVisibleSecond ?? null,
        targetLastVisibleEnemySecond: targetLastVisible ?? null,
        targetMotionGroupCount: targetMotion?.groupCount ?? null,
        targetMotionAverageConfidence: targetMotion?.averageConfidence ?? null,
        targetMotionControlReadiness10: targetMotion?.controlReadiness10 ?? null,
        targetMotionSource: targetMotion?.source ?? null,
        currentLastVisibleEnemySecond: current.lastActiveEnemySecond,
        currentVisibleMotionEndDriftSeconds: visibleMotionDrift,
        currentVsTargetVisibleMotionEndDriftSeconds: targetVisibleMotionDrift,
        currentLastChallengeEnemySecond: current.lastChallengeEnemySecond,
        currentChallengeEnemyEndDriftSeconds: challengeEnemyDrift,
        targetResultCeremonyHoldSeconds: targetResultCeremonyHold,
        currentResultCeremonyHoldSeconds: resultCeremonyHold,
        currentResultCeremonyHoldDriftSeconds: resultCeremonyHoldDrift,
        currentChallengeEndedSecond: current.challengeEndedSecond,
        currentVsTargetEndDriftSeconds: drift,
        syncRead: syncRead(windowRow, current),
        targetWindow: {
          id: windowRow.id || id,
          sourceId: windowRow.sourceId || '',
          startSeconds: round(windowRow.start || 0, 3),
          durationSeconds: round(windowRow.duration || durationSeconds, 2),
          family: windowRow.family || '',
          motionRead: windowRow.motionRead || '',
          contactSheet: windowRow.contactSheet || null,
          denseContactSheet: windowRow.denseContactSheet || null,
          focusedSheet: windowRow.focusedSheet || null
        },
        currentTimelineSamples: current.samples,
        knownLimit: 'This aligns clips from stage start, but target object tracks and current object tracks are not yet time-warped. Human review should look for pace drift, group-count drift, visible arrival-vs-appearance drift, and whether the scoring window arrives at the same relative time.'
      });
    } catch (err) {
      cleanupStageOutputs([targetOut, currentOut, pairedOut, contactOut]);
      failures.push({
        challengeNumber,
        stageMarker: CHALLENGE_MARKERS[challengeNumber - 1] || null,
        id,
        label: challengeLabel(challengeNumber),
        targetWindow: {
          id: windowRow.id || id,
          sourceId: windowRow.sourceId || '',
          startSeconds: round(windowRow.start || 0, 3),
          durationSeconds: round(windowRow.duration || durationSeconds, 2),
          family: windowRow.family || ''
        },
        error: String(err?.message || err)
      });
    }
  }
  if(!rows.length) throw new Error(`No timing alignment rows completed. Failures: ${JSON.stringify(failures)}`);

  const driftValues = rows.map(row => Math.abs(row.currentVsTargetEndDriftSeconds)).filter(Number.isFinite);
  const visibleMotionDriftValues = rows.map(row => Math.abs(row.currentVisibleMotionEndDriftSeconds)).filter(Number.isFinite);
  const targetVisibleMotionDriftValues = rows.map(row => Math.abs(row.currentVsTargetVisibleMotionEndDriftSeconds)).filter(Number.isFinite);
  const challengeEnemyDriftValues = rows.map(row => Math.abs(row.currentChallengeEnemyEndDriftSeconds)).filter(Number.isFinite);
  const resultHoldValues = rows.map(row => row.currentResultCeremonyHoldSeconds).filter(Number.isFinite);
  const resultHoldDriftValues = rows.map(row => Math.abs(row.currentResultCeremonyHoldDriftSeconds)).filter(Number.isFinite);
  const requestedChallengeNumbers = windows.map(row => +row.challengeNumber).filter(Number.isFinite);
  const completedChallengeNumbers = rows.map(row => +row.challengeNumber).filter(Number.isFinite);
  const failedChallengeNumbers = failures.map(row => +row.challengeNumber).filter(Number.isFinite);
  const summary = {
    selectionMode: args.selectionMode,
    requestedChallengeNumbers,
    completedChallengeNumbers,
    failedChallengeNumbers,
    requestedChallengeCount: requestedChallengeNumbers.length,
    challengeCount: rows.length,
    completedChallengeCount: rows.length,
    failedChallengeCount: failures.length,
    pairedVideoCount: rows.filter(row => row.pairedVideo && fs.existsSync(path.join(ROOT, row.pairedVideo))).length,
    contactSheetCount: rows.filter(row => row.contactSheet && fs.existsSync(path.join(ROOT, row.contactSheet))).length,
    averageAbsEndDriftSeconds: driftValues.length ? round(driftValues.reduce((sum, value) => sum + value, 0) / driftValues.length, 2) : null,
    maxAbsEndDriftSeconds: driftValues.length ? round(Math.max(...driftValues), 2) : null,
    averageAbsVisibleMotionEndDriftSeconds: visibleMotionDriftValues.length ? round(visibleMotionDriftValues.reduce((sum, value) => sum + value, 0) / visibleMotionDriftValues.length, 2) : null,
    maxAbsVisibleMotionEndDriftSeconds: visibleMotionDriftValues.length ? round(Math.max(...visibleMotionDriftValues), 2) : null,
    averageAbsTargetVisibleMotionEndDriftSeconds: targetVisibleMotionDriftValues.length ? round(targetVisibleMotionDriftValues.reduce((sum, value) => sum + value, 0) / targetVisibleMotionDriftValues.length, 2) : null,
    maxAbsTargetVisibleMotionEndDriftSeconds: targetVisibleMotionDriftValues.length ? round(Math.max(...targetVisibleMotionDriftValues), 2) : null,
    averageAbsChallengeEnemyEndDriftSeconds: challengeEnemyDriftValues.length ? round(challengeEnemyDriftValues.reduce((sum, value) => sum + value, 0) / challengeEnemyDriftValues.length, 2) : null,
    maxAbsChallengeEnemyEndDriftSeconds: challengeEnemyDriftValues.length ? round(Math.max(...challengeEnemyDriftValues), 2) : null,
    averageResultCeremonyHoldSeconds: resultHoldValues.length ? round(resultHoldValues.reduce((sum, value) => sum + value, 0) / resultHoldValues.length, 2) : null,
    averageAbsResultCeremonyHoldDriftSeconds: resultHoldDriftValues.length ? round(resultHoldDriftValues.reduce((sum, value) => sum + value, 0) / resultHoldDriftValues.length, 2) : null,
    read: `Requested challenges ${requestedChallengeNumbers.join(', ') || 'none'}; completed ${completedChallengeNumbers.join(', ') || 'none'}${failedChallengeNumbers.length ? `; failed ${failedChallengeNumbers.join(', ')}` : '; no capture failures'}. These videos put Galaga target footage on the left and Aurora current controlled-clock footage on the right from t=0, so pace and complexity drift can be reviewed without guessing which mid-stage moment was sampled.`
  };
  const report = {
    schemaVersion: 1,
    artifactType: 'level-visual-timing-alignment',
    generatedAt,
    branch,
    commit,
    summary,
    rows,
    failures,
    sourceArtifacts: {
      galagaChallengeVideoReference: 'reference-artifacts/analyses/galaga-challenge-video-reference/latest.json',
      levelVisualConformanceIndex: 'reference-artifacts/analyses/level-visual-conformance-index/latest.json',
      challengeStageConformance: 'reference-artifacts/analyses/challenge-stage-conformance/latest.json'
    },
    measurementLimits: [
      'This artifact is challenge-stage only; regular levels need separate stage-start target segmentation.',
      'Aurora current clips are controlled-clock browser renders without live audio.',
      'The paired video aligns t=0 and duration, but does not yet time-warp individual target/current object tracks.',
      'Use this as a before/after human review aid and as a source for future stage-duration and group-timing metrics.'
    ],
    nextBestSteps: [
      'Promote target object-track first-visible and last-visible times into each challenge set-piece contract.',
      'Score current challenge group timing against the stage-start aligned target windows.',
      'Use paired clips as before/after release artifacts whenever a challenge-stage implementation changes.'
    ]
  };
  const stamp = `${generatedAt.slice(0, 10)}-${commit}`;
  writeJson(path.join(OUT_ROOT, stamp, 'report.json'), report);
  writeText(path.join(OUT_ROOT, stamp, 'README.md'), buildMarkdown(report));
  writeJson(LATEST_JSON, report);
  writeText(TOP_LEVEL_MD, buildMarkdown(report));
  return report;
}

buildReport().then(report => {
  console.log(JSON.stringify({
    ok: true,
    selectionMode: report.summary.selectionMode,
    requestedChallengeNumbers: report.summary.requestedChallengeNumbers,
    completedChallengeNumbers: report.summary.completedChallengeNumbers,
    failedChallengeNumbers: report.summary.failedChallengeNumbers,
    challengeCount: report.summary.challengeCount,
    pairedVideoCount: report.summary.pairedVideoCount,
    contactSheetCount: report.summary.contactSheetCount,
    averageAbsEndDriftSeconds: report.summary.averageAbsEndDriftSeconds,
    averageAbsVisibleMotionEndDriftSeconds: report.summary.averageAbsVisibleMotionEndDriftSeconds,
    averageAbsTargetVisibleMotionEndDriftSeconds: report.summary.averageAbsTargetVisibleMotionEndDriftSeconds,
    averageAbsChallengeEnemyEndDriftSeconds: report.summary.averageAbsChallengeEnemyEndDriftSeconds,
    averageResultCeremonyHoldSeconds: report.summary.averageResultCeremonyHoldSeconds,
    averageAbsResultCeremonyHoldDriftSeconds: report.summary.averageAbsResultCeremonyHoldDriftSeconds,
    latest: rel(LATEST_JSON),
    markdown: rel(TOP_LEVEL_MD)
  }, null, 2));
}).catch(err => {
  console.error(err && err.stack || String(err));
  process.exit(1);
});

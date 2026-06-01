#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');
const { ensureUsableVideoArtifact } = require('./video-artifact-util');

const ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_OUT_DIR = path.join(ROOT, 'reference-artifacts', 'analyses', 'gameplay-segment-captures');

function parseArgs(argv){
  const args = {};
  for(let i = 0; i < argv.length; i += 1){
    const raw = argv[i];
    if(!raw.startsWith('--')) continue;
    const eq = raw.indexOf('=');
    if(eq > -1){
      args[raw.slice(2, eq)] = raw.slice(eq + 1);
      continue;
    }
    const key = raw.slice(2);
    const next = argv[i + 1];
    if(!next || next.startsWith('--')) args[key] = true;
    else{
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function boolValue(value, fallback = false){
  if(value === undefined) return fallback;
  if(value === true) return true;
  const text = String(value).trim().toLowerCase();
  if(['1', 'true', 'yes', 'on'].includes(text)) return true;
  if(['0', 'false', 'no', 'off'].includes(text)) return false;
  return fallback;
}

function numberValue(value, fallback, min, max){
  const n = Number(value);
  const next = Number.isFinite(n) ? n : fallback;
  return Math.max(min, Math.min(max, next));
}

function slug(value, fallback = 'segment'){
  const text = String(value || fallback).trim().toLowerCase();
  return text.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || fallback;
}

function stamp(value){
  return String(value || new Date().toISOString()).replace(/[:.]/g, '-');
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function createContactSheet(videoFile, outFile){
  const result = spawnSync('ffmpeg', [
    '-y',
    '-v', 'error',
    '-i', videoFile,
    '-vf', 'fps=1,scale=240:-1,tile=5x6',
    outFile
  ], {
    encoding: 'utf8',
    timeout: 120000
  });
  if(result.status !== 0){
    return {
      ok: false,
      error: result.stderr || result.stdout || `ffmpeg exited ${result.status}`,
      status: result.status,
      signal: result.signal
    };
  }
  return { ok: true, file: outFile };
}

function dataUrlToBuffer(dataUrl){
  const text = String(dataUrl || '');
  const marker = text.toLowerCase().indexOf(';base64,');
  if(marker < 0 || !text.toLowerCase().startsWith('data:')) return Buffer.alloc(0);
  return Buffer.from(text.slice(marker + ';base64,'.length), 'base64');
}

function captureConfig(args){
  const rawStartKind = String(args['start-kind'] || args.startKind || (boolValue(args.challenge, false) ? 'challenge' : 'level')).trim().toLowerCase();
  const startKind = rawStartKind === 'challenge-tour' ? 'challenge-tour' : (rawStartKind === 'challenge' ? 'challenge' : 'level');
  const wantsChallengeWindow = startKind === 'challenge' || startKind === 'challenge-tour';
  const mode = String(args.mode || '').trim().toLowerCase();
  const persona = String(args.persona || args['watch-persona'] || args.expertPlays || '').trim().toLowerCase();
  const watchPersona = String(args['watch-persona'] || (mode === 'watch' ? persona : '') || '').trim().toLowerCase();
  const expertPlays = String(args['expert-plays'] || args.expertPlays || watchPersona || '').trim().toLowerCase();
  const stageMode = String(args['stage-mode'] || args.stageMode || (wantsChallengeWindow ? 'display' : 'internal')).toLowerCase() === 'display'
    ? 'display'
    : 'internal';
  const defaultChallengeStage = startKind === 'challenge-tour' ? 1 : 3;
  const challengeStage = Math.max(1, Math.floor(numberValue(args['challenge-stage'] || args.challengeStage, defaultChallengeStage, 1, 99)));
  const stage = Math.max(1, Math.floor(numberValue(args.stage, wantsChallengeWindow ? 3 + (challengeStage - 1) * 4 : 1, 1, 99)));
  const seconds = numberValue(args.seconds || args.duration, startKind === 'challenge-tour' ? 210 : 30, 3, 300);
  const preRoll = numberValue(args['pre-roll'] || args.preRoll, 0.15, 0, 120);
  const warmup = numberValue(args.warmup, 0.12, 0, 5);
  const waitForActive = boolValue(args['wait-for-active'] || args.waitForActive, true);
  const activeMinEnemies = Math.max(1, Math.min(40, Math.floor(numberValue(args['active-min-enemies'] || args.activeMinEnemies, wantsChallengeWindow ? 3 : 1, 1, 40))));
  const minStageClock = numberValue(args['min-stage-clock'] || args.minStageClock, 0, 0, 240);
  const maxWaitActive = numberValue(args['max-wait-active'] || args.maxWaitActive, wantsChallengeWindow ? 35 : 12, 0, 180);
  const activePollMs = Math.max(50, Math.min(1000, Math.floor(numberValue(args['active-poll-ms'] || args.activePollMs, 150, 50, 1000))));
  const seed = (+numberValue(args.seed, 9052, 1, 0xffffffff) >>> 0) || 9052;
  const fps = Math.max(12, Math.min(60, Math.floor(numberValue(args.fps, 60, 12, 60))));
  const width = Math.max(360, Math.min(1920, Math.floor(numberValue(args.width, 960, 360, 1920))));
  const height = Math.max(480, Math.min(2160, Math.floor(numberValue(args.height, 1280, 480, 2160))));
  const labelBase = startKind === 'challenge-tour' ? 'challenge-tour' : (startKind === 'challenge' ? `challenge-${challengeStage}` : `stage-${stage}`);
  const label = slug(args.label || `${labelBase}${persona ? `-${persona}` : ''}`);
  return {
    stage,
    stageMode,
    startKind,
    challenge: wantsChallengeWindow || boolValue(args.challenge, false),
    challengeStage,
    ships: Math.max(1, Math.min(9, Math.floor(numberValue(args.ships, 3, 1, 9)))),
    persona,
    watchPersona,
    expertPlays,
    playerTwo: boolValue(args['player-two'] || args.playerTwo, false),
    playerTwoPersona: String(args['player-two-persona'] || args.playerTwoPersona || '').trim().toLowerCase(),
    seconds,
    preRoll,
    warmup,
    waitForActive,
    activeMinEnemies,
    minStageClock,
    maxWaitActive,
    activePollMs,
    seed,
    fps,
    width,
    height,
    includeAudio: boolValue(args.audio, true),
    setup: String(args.setup || 'start').trim().toLowerCase(),
    label,
    comparisonId: String(args['comparison-id'] || args.comparisonId || '').trim(),
    variant: String(args.variant || '').trim(),
    notes: String(args.notes || '').trim(),
    outDir: path.resolve(args['out-dir'] || args.outDir || DEFAULT_OUT_DIR)
  };
}

async function main(){
  const cfg = captureConfig(parseArgs(process.argv.slice(2)));
  fs.mkdirSync(cfg.outDir, { recursive: true });

  const runStamp = stamp(process.env.AURORA_CAPTURE_STAMP || new Date().toISOString());
  const base = `${cfg.label}-${runStamp}`;
  const videoFile = path.join(cfg.outDir, `${base}.webm`);
  const posterFile = path.join(cfg.outDir, `${base}.png`);
  const contactSheetFile = path.join(cfg.outDir, `${base}-contact-sheet.jpg`);
  const reportFile = path.join(cfg.outDir, `${base}.json`);
  const latestVideo = path.join(cfg.outDir, `latest-${cfg.label}.webm`);
  const latestPoster = path.join(cfg.outDir, `latest-${cfg.label}.png`);
  const latestContactSheet = path.join(cfg.outDir, `latest-${cfg.label}-contact-sheet.jpg`);
  const latestReport = path.join(cfg.outDir, `latest-${cfg.label}.json`);
  const globalLatest = path.join(cfg.outDir, 'latest.json');

  const pageResult = await withHarnessPage({
    stage: cfg.stage,
    ships: cfg.ships,
    challenge: cfg.challenge,
    seed: cfg.seed,
    persona: cfg.persona || null,
    skipStart: true,
    viewport: { width: cfg.width, height: cfg.height }
  }, async ({ page }) => page.evaluate(async options => {
    const api = window.__galagaHarness__;
    const canvas = document.getElementById('c');
    if(!api) return { ok: false, error: 'harness api unavailable' };
    if(!canvas || !canvas.captureStream) return { ok: false, error: 'canvas captureStream unavailable' };
    if(!window.MediaRecorder) return { ok: false, error: 'MediaRecorder unavailable' };

    function delay(ms){
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    function readBlobAsDataUrl(blob){
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error || new Error('FileReader failed'));
        reader.readAsDataURL(blob);
      });
    }

    function pickVideoMime(){
      const candidates = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
      return candidates.find(candidate => window.MediaRecorder.isTypeSupported(candidate)) || '';
    }

    function visibleTargetsFromSnapshot(snapshot, key){
      const rows = Array.isArray(snapshot?.[key]) ? snapshot[key] : [];
      return rows.filter(item => {
        const spawn = Number(item.spawn || 0);
        const x = Number(item.x || 0);
        const y = Number(item.y || 0);
        return spawn <= 0.05 && x > -36 && x < 316 && y > -36 && y < 396;
      });
    }

    function activitySnapshot(){
      const state = api.state ? api.state() : {};
      const challengeState = api.challengeFormationState ? api.challengeFormationState() : null;
      const formationState = api.formationState ? api.formationState() : null;
      const challengeVisible = visibleTargetsFromSnapshot(challengeState, 'enemies');
      const formationVisible = visibleTargetsFromSnapshot(formationState, 'targets');
      const wantsChallenge = options.startKind === 'challenge' || options.startKind === 'challenge-tour';
      const visible = wantsChallenge ? challengeVisible : (state.challenge ? challengeVisible : formationVisible);
      const stageClockReady = Number(state.stageClock || 0) >= Number(options.minStageClock || 0);
      const stillCorrectWindow = wantsChallenge ? !!state.challenge : true;
      return {
        state,
        challenge: !!state.challenge,
        stage: state.stage || null,
        stageClock: Number(state.stageClock || 0),
        score: Number(state.score || 0),
        visibleEnemyCount: visible.length,
        challengeVisibleEnemyCount: challengeVisible.length,
        formationVisibleEnemyCount: formationVisible.length,
        stageClockReady,
        stillCorrectWindow,
        active: stillCorrectWindow && stageClockReady && visible.length >= options.activeMinEnemies
      };
    }

    async function waitForActiveCaptureWindow(){
      const start = performance.now();
      let snapshot = activitySnapshot();
      if(!options.waitForActive) return Object.assign({ waitedMs: 0, timedOut: false }, snapshot);
      const maxWaitMs = Math.max(0, Math.round(options.maxWaitActive * 1000));
      while(!snapshot.active && performance.now() - start < maxWaitMs){
        await delay(options.activePollMs);
        snapshot = activitySnapshot();
      }
      return Object.assign({
        waitedMs: Math.round(performance.now() - start),
        timedOut: !snapshot.active
      }, snapshot);
    }

    function startSegment(){
      if(options.setup === 'challenge-profile'){
        return api.setupChallengeMotionProfileTest({ stage: options.stage });
      }
      if(options.playerTwoPersona && typeof api.setPlayerTwoMode === 'function'){
        api.setPlayerTwoMode({ enabled: !!options.playerTwo, persona: options.playerTwoPersona, silent: true });
      }
      const startCfg = {
        stage: options.stage,
        stageMode: options.stageMode,
        startKind: options.startKind,
        challenge: !!options.challenge,
        challengeStage: options.challengeStage,
        ships: options.ships,
        seed: options.seed,
        persona: options.persona || null,
        watchPersona: options.watchPersona || null,
        expertPlays: options.expertPlays || undefined,
        playerTwo: !!options.playerTwo,
        playerTwoPersona: options.playerTwoPersona || undefined,
        autoVideo: false
      };
      return api.start(startCfg);
    }

    const startResult = startSegment();
    await delay(Math.round(options.warmup * 1000));
    const captureStartActivity = await waitForActiveCaptureWindow();
    if(options.preRoll > 0) await delay(Math.round(options.preRoll * 1000));

    const videoStream = canvas.captureStream(options.fps);
    const stream = new MediaStream();
    for(const track of videoStream.getVideoTracks()) stream.addTrack(track);

    const cleanup = [];
    const audioDiagnostics = {
      requested: !!options.includeAudio,
      contextStateBefore: null,
      contextStateAfter: null,
      tapAvailableBefore: false,
      tapAvailableAfter: false,
      trackStates: [],
      warning: ''
    };
    let audioTrackCount = 0;
    if(options.includeAudio){
      try{
        const audioPrep = typeof api.prepareSegmentCaptureAudio === 'function'
          ? await api.prepareSegmentCaptureAudio({ keepAliveGain: 0.00035, keepAliveHz: 23 })
          : null;
        Object.assign(audioDiagnostics, audioPrep?.diagnostics || {});
        if(audioPrep?.cleanupId && typeof api.finishSegmentCaptureAudio === 'function'){
          cleanup.push(() => api.finishSegmentCaptureAudio(audioPrep.cleanupId));
        }
        const audioTracks = Array.from(audioPrep?.tracks || []);
        for(const track of audioTracks){
          stream.addTrack(typeof track.clone === 'function' ? track.clone() : track);
          audioTrackCount += 1;
        }
        if(!audioTrackCount) audioDiagnostics.warning = 'No audio tracks were available from the game audio tap; capture is video-only.';
      }catch(err){
        audioDiagnostics.warning = String(err?.message || err || 'segment capture audio tap unavailable');
        console.warn('segment capture audio tap unavailable', err);
      }
    }

    const chunks = [];
    const mime = pickVideoMime();
    const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    recorder.ondataavailable = event => {
      if(event.data && event.data.size > 0) chunks.push(event.data);
    };

    recorder.start(250);
    await delay(Math.round(options.seconds * 1000));
    const finalState = api.state ? api.state() : null;
    const formationState = api.challengeFormationState ? api.challengeFormationState() : null;
    const posterDataUrl = canvas.toDataURL('image/png');
    const stopped = new Promise(resolve => { recorder.onstop = resolve; });
    recorder.stop();
    await stopped;
    for(const fn of cleanup.reverse()) fn();
    for(const track of stream.getTracks()) track.stop();
    for(const track of videoStream.getTracks()) track.stop();

    const blob = new Blob(chunks, { type: recorder.mimeType || mime || 'video/webm' });
    const videoDataUrl = await readBlobAsDataUrl(blob);
    return {
      ok: true,
      mime: blob.type || recorder.mimeType || 'video/webm',
      byteLength: blob.size,
      audioTrackCount,
      audioDiagnostics,
      videoDataUrl,
      posterDataUrl,
      startResult,
      captureStartActivity,
      finalState,
      formationState: formationState ? {
        stage: formationState.stage,
        challenge: !!formationState.challenge,
        layoutId: formationState.layout?.id || '',
        enemyCount: (formationState.enemies || []).length,
        referencePathGroups: Array.isArray(formationState.layout?.groupReferencePaths) ? formationState.layout.groupReferencePaths.length : 0,
        activeReferenceTrackedEnemies: (formationState.enemies || []).filter(e => e.referencePath).length,
        referenceTrackIds: [...new Set((formationState.enemies || []).map(e => e.referencePath?.sourceTrackId).filter(Boolean))]
      } : null
    };
  }, cfg));

  if(!pageResult?.ok) fail('gameplay segment capture failed', pageResult);
  if(cfg.waitForActive && pageResult.captureStartActivity?.timedOut){
    fail('gameplay segment capture did not find an active gameplay window before recording', {
      captureStartActivity: pageResult.captureStartActivity,
      cfg
    });
  }
  if((cfg.startKind === 'challenge' || cfg.startKind === 'challenge-tour') && pageResult.captureStartActivity && !pageResult.captureStartActivity.challenge){
    fail('challenge gameplay segment capture left the challenge before the active window was reached', {
      captureStartActivity: pageResult.captureStartActivity,
      cfg
    });
  }

  const videoBytes = dataUrlToBuffer(pageResult.videoDataUrl);
  const posterBytes = dataUrlToBuffer(pageResult.posterDataUrl);
  if(videoBytes.length < 100000 && cfg.seconds > 10){
    fail('captured video is unexpectedly small', {
      byteLength: videoBytes.length,
      reportedByteLength: pageResult.byteLength,
      seconds: cfg.seconds
    });
  }
  if(posterBytes.length < 1000) fail('captured poster is unexpectedly small', { byteLength: posterBytes.length });

  fs.writeFileSync(videoFile, videoBytes);
  fs.writeFileSync(posterFile, posterBytes);
  fs.copyFileSync(videoFile, latestVideo);
  fs.copyFileSync(posterFile, latestPoster);

  let videoAssessment = null;
  try{
    videoAssessment = ensureUsableVideoArtifact(videoFile, cfg.seconds);
  }catch(err){
    videoAssessment = {
      ok: false,
      error: String(err?.message || err),
      payload: err?.payload || null
    };
  }

  const assessedVideoFile = videoAssessment?.file && fs.existsSync(videoAssessment.file)
    ? videoAssessment.file
    : videoFile;
  if(assessedVideoFile !== videoFile){
    fs.copyFileSync(assessedVideoFile, latestVideo);
  }
  const contactSheet = createContactSheet(assessedVideoFile, contactSheetFile);
  if(contactSheet.ok && fs.existsSync(contactSheetFile)){
    fs.copyFileSync(contactSheetFile, latestContactSheet);
  }

  const report = {
    ok: true,
    artifactType: 'gameplay-segment-capture',
    generatedAt: new Date().toISOString(),
    label: cfg.label,
    comparisonId: cfg.comparisonId || null,
    variant: cfg.variant || null,
    notes: cfg.notes || null,
    capture: {
      stage: cfg.stage,
      stageMode: cfg.stageMode,
      startKind: cfg.startKind,
      challenge: cfg.challenge,
      challengeStage: cfg.challengeStage,
      ships: cfg.ships,
      persona: cfg.persona || null,
      watchPersona: cfg.watchPersona || null,
      expertPlays: cfg.expertPlays || null,
      playerTwo: cfg.playerTwo,
      playerTwoPersona: cfg.playerTwoPersona || null,
      seed: cfg.seed,
      seconds: cfg.seconds,
      preRoll: cfg.preRoll,
      warmup: cfg.warmup,
      waitForActive: cfg.waitForActive,
      activeMinEnemies: cfg.activeMinEnemies,
      minStageClock: cfg.minStageClock,
      maxWaitActive: cfg.maxWaitActive,
      activePollMs: cfg.activePollMs,
      fps: cfg.fps,
      viewport: { width: cfg.width, height: cfg.height },
      includeAudio: cfg.includeAudio,
      audioTrackCount: pageResult.audioTrackCount || 0,
      audioDiagnostics: pageResult.audioDiagnostics || null,
      setup: cfg.setup
    },
    video: rel(assessedVideoFile),
    rawVideo: rel(videoFile),
    latestVideo: rel(latestVideo),
    poster: rel(posterFile),
    latestPoster: rel(latestPoster),
    contactSheet: contactSheet.ok ? rel(contactSheetFile) : null,
    latestContactSheet: contactSheet.ok ? rel(latestContactSheet) : null,
    byteLength: fs.statSync(assessedVideoFile).size,
    mime: pageResult.mime,
    videoAssessment,
    contactSheetAssessment: contactSheet,
    startState: pageResult.startResult || null,
    captureStartActivity: pageResult.captureStartActivity || null,
    finalState: pageResult.finalState || null,
    formationState: pageResult.formationState || null,
    reviewFocus: [
      'Use these clips for human-visible before/after review of movement, graphics, stage pacing, persona behavior, and audio feel.',
      'Pair captures with the same seed/start/persona settings when comparing candidates.',
      'For challenge-stage conformance, prefer startKind=challenge plus challengeStage=N so the public display label stays aligned with the internal stage marker.',
      'For Challenge Tour review, use startKind=challenge-tour plus a watch persona to capture the ordered challenge sequence without recording a score.',
      'By default, recording waits until player-visible enemies are active; pass --wait-for-active=0 when the transition or blank/setup time is the intended evidence window.'
    ],
    warnings: [
      ...(pageResult.captureStartActivity?.timedOut ? ['Capture waited for active gameplay but timed out; the video may include setup/dead time.'] : []),
      ...((cfg.startKind === 'challenge' || cfg.startKind === 'challenge-tour') && pageResult.captureStartActivity && !pageResult.captureStartActivity.challenge ? ['Challenge capture did not start inside a challenge window; discard this artifact for challenge-stage review.'] : []),
      ...(cfg.includeAudio && !(pageResult.audioTrackCount > 0) ? ['Audio was requested but the capture contains no audio track; use this as visual/motion evidence only.'] : []),
      ...(videoAssessment?.audioStreams && pageResult.audioTrackCount > 0 && videoAssessment.audioStreams.length === 0 ? ['Audio tracks were present during capture but absent after artifact repair; inspect rawVideo.'] : [])
    ]
  };

  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  fs.copyFileSync(reportFile, latestReport);
  fs.copyFileSync(reportFile, globalLatest);

  console.log(JSON.stringify(report, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

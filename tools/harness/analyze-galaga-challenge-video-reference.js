#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync, execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-challenge-video-reference');
const REPORT_MD = path.join(ROOT, 'GALAGA_CHALLENGE_VIDEO_REFERENCE_ANALYSIS.md');

const SOURCES = [
  {
    id: 'challenge-all2-single-ship-all-perfects',
    role: 'primary-all-challenge-window-source',
    title: 'Galaga challenge stages all perfects single ship',
    localPath: '/Users/sgwoods/Downloads/challenge-all2.mp4',
    note: 'User-supplied local video; raw video remains outside the repo. Derived contact sheets and timing windows are committed for conformance work.',
    overviewFps: '1/5',
    overviewScale: '160:120',
    overviewTile: '9x6'
  },
  {
    id: 'challenging-stage-compilation',
    role: 'secondary-cross-check-source',
    title: 'Galaga challenging-stage compilation',
    localPath: '/Users/sgwoods/Downloads/challenging.mp4',
    note: 'User-supplied local video used as a secondary visual cross-check for stage variety and repeated perfect/result surfaces.',
    overviewFps: '1/5',
    overviewScale: '140:180',
    overviewTile: '9x6'
  }
];

const PRIMARY_WINDOWS = [
  {
    challengeNumber: 1,
    stageMarker: 3,
    id: 'challenge-01-classic-column-lesson',
    start: 5,
    duration: 31,
    family: 'classic-column-and-side-arc',
    targetFamilies: ['classic bee', 'classic butterfly', 'boss marker'],
    motionRead: 'Introductory challenge teaches vertical columns, simple side hooks, upper-band score windows, and the perfect-result loop.',
    auroraContract: 'Use as the teaching stage: five readable groups, no combat, clear upper-band score lanes, and a result cadence that lets the player understand 40/40.'
  },
  {
    challengeNumber: 2,
    stageMarker: 7,
    id: 'challenge-02-cross-and-column',
    start: 36,
    duration: 39,
    family: 'red-column-blue-side-cross',
    targetFamilies: ['red column family', 'blue side family', 'green side family'],
    motionRead: 'Adds side-crossing and vertical red-column trains; groups arrive through visible route commitments rather than appearing in place.',
    auroraContract: 'Add distinct side-entry crossing groups and a red-column vertical train; preserve no-shot/no-collision behavior while increasing route memory.'
  },
  {
    challengeNumber: 3,
    stageMarker: 11,
    id: 'challenge-03-blue-hook-and-green-novelty',
    start: 75,
    duration: 38,
    family: 'blue-hook-green-novelty',
    targetFamilies: ['blue hook family', 'green novelty family', 'boss marker'],
    motionRead: 'Blue side hooks and green novelty shapes make the third challenge visually distinct and less column-like.',
    auroraContract: 'Introduce a clearly new visual family and hooked side trajectories; score should reward anticipation of the hook, not pure center firing.'
  },
  {
    challengeNumber: 4,
    stageMarker: 15,
    id: 'challenge-04-pink-serpentine',
    start: 113,
    duration: 35,
    family: 'pink-serpentine-and-green-entry',
    targetFamilies: ['pink specialty family', 'green specialty family'],
    motionRead: 'Late challenge starts showing long pink serpentine arcs and separate green specialty entries.',
    auroraContract: 'Replace repeated boss-led loops with a long serpentine specialty arc; this is the first high-priority late-stage rebuild target.'
  },
  {
    challengeNumber: 5,
    stageMarker: 19,
    id: 'challenge-05-pink-and-green-cascade',
    start: 142,
    duration: 35,
    family: 'pink-green-cascade',
    targetFamilies: ['pink specialty family', 'green ladder family', 'boss marker'],
    motionRead: 'Continues specialty novelty with pink arcs, green lower-field entries, and a clearer split between group identities.',
    auroraContract: 'Build as a cascade stage: alternating specialty groups, lower-field pass risk, and stronger color/family novelty than Challenge 4.'
  },
  {
    challengeNumber: 6,
    stageMarker: 23,
    id: 'challenge-06-green-ladder-split',
    start: 175,
    duration: 38,
    family: 'green-ladder-and-split',
    targetFamilies: ['green ladder family', 'blue/purple support family'],
    motionRead: 'Green ladder and split entries emphasize staggered group timing and route separation.',
    auroraContract: 'Use staggered ladders and split exits; measure group spacing and route separation so the stage feels authored, not dense noise.'
  },
  {
    challengeNumber: 7,
    stageMarker: 27,
    id: 'challenge-07-yellow-diagonal-fan',
    start: 215,
    duration: 34,
    family: 'yellow-diagonal-fan',
    targetFamilies: ['yellow specialty family', 'green support family'],
    motionRead: 'Yellow diagonal trains create a memorable late-stage fan/diagonal score lane.',
    auroraContract: 'Add a yellow diagonal/fan stage with long path length, readable aim bands, and a visually obvious new family.'
  },
  {
    challengeNumber: 8,
    stageMarker: 31,
    id: 'challenge-08-blue-purple-finale',
    start: 241,
    duration: 30,
    family: 'blue-purple-finale',
    targetFamilies: ['blue/purple specialty family', 'boss marker'],
    motionRead: 'Final visible challenge window emphasizes blue/purple clustered arcs and a compact all-perfect finish.',
    auroraContract: 'Use as the late-loop capstone: blue/purple clustered arcs, compact timing, and no repeated early-stage motion vocabulary.'
  }
];

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function run(cmd, args, opts = {}){
  const result = spawnSync(cmd, args, Object.assign({
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 60,
    timeout: 1000 * 60 * 20
  }, opts));
  if(result.status !== 0){
    throw new Error(`${cmd} failed\nargs: ${args.join(' ')}\n${result.stderr || result.stdout || ''}`);
  }
  return result.stdout || result.stderr || '';
}

function writeJson(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${String(value).replace(/\r\n/g, '\n').trimEnd()}\n`);
}

function gitShortCommit(){
  try{
    return execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function sha256(file){
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(file));
  return hash.digest('hex');
}

function probeSource(file){
  const raw = run('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration,size,bit_rate:stream=codec_type,width,height,avg_frame_rate,duration',
    '-of', 'json',
    file
  ]);
  const json = JSON.parse(raw);
  const video = (json.streams || []).find(stream => stream.codec_type === 'video') || {};
  const audio = (json.streams || []).find(stream => stream.codec_type === 'audio') || {};
  return {
    durationSeconds: +(+(json.format?.duration || 0)).toFixed(3),
    sizeBytes: +(json.format?.size || 0),
    bitRate: +(json.format?.bit_rate || 0),
    width: video.width || 0,
    height: video.height || 0,
    frameRate: video.avg_frame_rate || '',
    videoDurationSeconds: +(+(video.duration || 0)).toFixed(3),
    audioCodecPresent: !!audio.codec_type
  };
}

function extractSheet({ input, outFile, start = null, duration = null, fps, scale, tile }){
  ensureDir(path.dirname(outFile));
  const args = ['-y'];
  if(start !== null) args.push('-ss', String(start));
  if(duration !== null) args.push('-t', String(duration));
  args.push('-i', input, '-vf', `fps=${fps},scale=${scale},tile=${tile}:padding=4:margin=4`, '-frames:v', '1', outFile);
  run('ffmpeg', args);
  return rel(outFile);
}

function sourceWithDerivedMedia(source){
  const exists = fs.existsSync(source.localPath);
  const measuredMedia = exists ? probeSource(source.localPath) : null;
  const sourceDir = path.join(OUT_ROOT, source.id);
  const overview = exists
    ? extractSheet({
      input: source.localPath,
      outFile: path.join(sourceDir, 'overview-5s-contact-sheet.jpg'),
      fps: source.overviewFps,
      scale: source.overviewScale,
      tile: source.overviewTile
    })
    : null;
  return Object.assign({}, source, {
    localPath: source.localPath,
    exists,
    sha256: exists ? sha256(source.localPath) : null,
    measuredMedia,
    derivedOverviewContactSheet: overview
  });
}

function extractPrimaryWindow(source, window){
  const outDir = path.join(OUT_ROOT, source.id, window.id);
  const contactSheet = extractSheet({
    input: source.localPath,
    outFile: path.join(outDir, 'contact-sheet-1fps.jpg'),
    start: window.start,
    duration: window.duration,
    fps: 1,
    scale: '144:108',
    tile: '8x5'
  });
  const denseContactSheet = extractSheet({
    input: source.localPath,
    outFile: path.join(outDir, 'contact-sheet-2fps.jpg'),
    start: window.start,
    duration: window.duration,
    fps: 2,
    scale: '120:90',
    tile: '10x8'
  });
  const focusedSheet = extractSheet({
    input: source.localPath,
    outFile: path.join(outDir, 'motion-review-4fps.jpg'),
    start: window.start,
    duration: Math.min(window.duration, 20),
    fps: 4,
    scale: '96:72',
    tile: '10x8'
  });
  const frameIndex = {
    schema: 'galaga-challenge-video-window-0.1',
    sourceId: source.id,
    windowId: window.id,
    challengeNumber: window.challengeNumber,
    stageMarker: window.stageMarker,
    startSeconds: window.start,
    durationSeconds: window.duration,
    sampledFps: 1,
    derivedSheets: {
      contactSheet,
      denseContactSheet,
      focusedSheet
    },
    frameTimes: Array.from({ length: Math.ceil(window.duration) }, (_, index) => ({
      frameIndex: index,
      tSourceSeconds: +(window.start + index).toFixed(3)
    })),
    manualRead: {
      family: window.family,
      targetFamilies: window.targetFamilies,
      motionRead: window.motionRead,
      auroraContract: window.auroraContract
    },
    measurementLimits: [
      'Window start/duration is a first-pass human-reviewed segmentation from contact sheets, not an OCR-validated exact title/result boundary.',
      'This artifact gives media-backed challenge-stage choreography and novelty evidence; it still needs group-by-group frame labels before lifting direct trajectory scoring gates.'
    ]
  };
  const frameIndexPath = path.join(outDir, 'frame-index.json');
  writeJson(frameIndexPath, frameIndex);
  writeText(path.join(outDir, 'README.md'), `# ${window.id}

Challenge: \`${window.challengeNumber}\`

Internal Aurora marker: \`${window.stageMarker}\`

Source: \`${source.title}\`

Window: \`${window.start}s-${window.start + window.duration}s\`

## Manual Read

${window.motionRead}

## Aurora Contract

${window.auroraContract}

## Derived Sheets

- \`${contactSheet}\`
- \`${denseContactSheet}\`
- \`${focusedSheet}\`
`);
  return Object.assign({}, window, {
    sourceId: source.id,
    evidenceStatus: 'media-backed-window-unlabeled-groups',
    contactSheet,
    denseContactSheet,
    focusedSheet,
    frameIndex: rel(frameIndexPath)
  });
}

function buildStageImprovementPlan(windows){
  return windows.map(window => ({
    challengeNumber: window.challengeNumber,
    stageMarker: window.stageMarker,
    priority: window.challengeNumber >= 4 ? 'highest' : 'high',
    targetFamily: window.family,
    currentAuroraProblem: window.challengeNumber >= 4
      ? 'Aurora late challenge stages are currently too repetitive and are not media-backed by distinct late-stage Galaga choreography.'
      : 'Aurora early challenge stages have useful structure but need stronger five-group labels and clearer route contracts.',
    implementationStrategy: window.auroraContract,
    measurementStrategy: [
      'Promote five group labels from this window: first visible time, entry side, path family, scoreable upper-band interval, exit side, alien family.',
      'Compare Aurora runtime challenge probes against target path family, group count, family novelty, result cadence, and no-combat guardrails.',
      'Only lift the strict movement/graphics score after group labels and runtime probes agree.'
    ],
    expectedUserImpact: window.challengeNumber >= 4
      ? 'Late challenge stages should start feeling like memorable Galaga score exhibitions instead of repeated waves.'
      : 'Early challenge stages should become clearer learning experiences with stronger perfect-bonus readability.'
  }));
}

function buildMarkdown(report){
  const summary = report.summary;
  return `# Galaga Challenge Video Reference Analysis

Generated: \`${report.generatedAt}\`

This analysis turns the two user-supplied Galaga challenge videos into durable
derived evidence for Aurora challenging-stage conformance. The raw videos remain
outside the repository; committed artifacts are contact sheets, timing windows,
manual reads, and implementation contracts.

## Summary

- Primary source: \`${summary.primarySourceId}\`
- Secondary source: \`${summary.secondarySourceId}\`
- Challenge windows: \`${summary.challengeWindowCount}\`
- Late challenge windows now media-backed: \`${summary.mediaBackedLateChallengeCount}/5\`
- Challenge-stage target readiness estimate: \`${summary.challengeStageReadiness10}/10\`
- Status: \`${summary.status}\`

## What The Videos Show

${summary.whatTheVideosShow.map(item => `- ${item}`).join('\n')}

## Window Reads

| Challenge | Stage Marker | Window | Family | Contact Sheet | Aurora Contract |
| ---: | ---: | --- | --- | --- | --- |
${report.primaryWindows.map(window => `| ${window.challengeNumber} | ${window.stageMarker} | ${window.start}s-${window.start + window.duration}s | ${window.family} | \`${window.contactSheet}\` | ${window.auroraContract} |`).join('\n')}

## Stage Improvement Plan

${report.stageImprovementPlan.map(item => `### Challenge ${item.challengeNumber} / Stage Marker ${item.stageMarker}

Priority: \`${item.priority}\`

Target family: \`${item.targetFamily}\`

Problem: ${item.currentAuroraProblem}

Strategy: ${item.implementationStrategy}

Player impact: ${item.expectedUserImpact}
`).join('\n')}

## Next Best Steps

${report.nextBestSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}
`;
}

function main(){
  ensureDir(OUT_ROOT);
  const generatedAt = new Date().toISOString();
  const commit = gitShortCommit();
  const runDir = path.join(OUT_ROOT, `${generatedAt.slice(0, 10)}-${commit}`);
  ensureDir(runDir);
  const sources = SOURCES.map(sourceWithDerivedMedia);
  const primary = sources.find(source => source.id === 'challenge-all2-single-ship-all-perfects');
  if(!primary?.exists){
    throw new Error(`Primary challenge reference source is missing: ${primary?.localPath || 'unknown'}`);
  }
  const primaryWindows = PRIMARY_WINDOWS.map(window => extractPrimaryWindow(primary, window));
  const mediaBackedLateChallengeCount = primaryWindows.filter(window => window.challengeNumber >= 4 && window.challengeNumber <= 8).length;
  const report = {
    generatedAt,
    commit,
    artifactType: 'galaga-challenge-video-reference-analysis',
    schema: 'galaga-challenge-video-reference-analysis-0.1',
    summary: {
      status: mediaBackedLateChallengeCount >= 5
        ? 'late-challenge-media-windows-ready-for-labeling'
        : 'late-challenge-media-windows-incomplete',
      primarySourceId: primary.id,
      secondarySourceId: 'challenging-stage-compilation',
      sourceCount: sources.length,
      challengeWindowCount: primaryWindows.length,
      mediaBackedLateChallengeCount,
      challengeStageReadiness10: mediaBackedLateChallengeCount >= 5 ? 4.5 : 2.2,
      whatTheVideosShow: [
        'The challenge stages are non-combat score exhibitions: no enemy bullets, no ship-loss pressure, and repeated 40-hit perfect result screens.',
        'Each stage is built from visible group arrivals, not static appearances; the player reads routes and learns where the scoring lane will be.',
        'Progression adds new visual families and motion grammar: vertical columns, side hooks, crossing groups, serpentine arcs, green ladders, yellow diagonal fans, and blue/purple late clusters.',
        'The user-facing conformance gap in Aurora is mostly spectacle, route memory, and alien novelty, not the no-shot/no-kill safety rule.'
      ],
      measurementLimits: [
        'Window segmentation is first-pass and contact-sheet reviewed; it should be refined by OCR or manual per-group labels before direct frame scoring.',
        'The primary source is a compilation of challenge stages, not a full normal-stage playthrough; it is excellent for challenge choreography but not normal-stage pacing.',
        'Raw source videos are not committed. The repo stores derived contact sheets, hashes, window metadata, and manual reads.'
      ]
    },
    sources,
    primaryWindows,
    stageImprovementPlan: buildStageImprovementPlan(primaryWindows),
    nextBestSteps: [
      'Promote challenge-all2 windows into accepted five-group reference labels for Challenges 1-8.',
      'Rebuild Aurora Challenge 4 first with the pink-serpentine contract because it is the most visible current late-stage embarrassment.',
      'Then rebuild Challenge 7 with the yellow-diagonal-fan contract because it creates a strong player-visible novelty jump.',
      'Add runtime probes that verify each Aurora challenge has five groups, no shots, no ship losses, distinct path families, and expected visual-family novelty.',
      'Only after labels exist, lift challenge-stage target readiness from partial media evidence to direct trajectory scoring.'
    ],
    outputs: {
      latest: rel(path.join(OUT_ROOT, 'latest.json')),
      markdown: rel(REPORT_MD)
    }
  };
  writeJson(path.join(runDir, 'report.json'), report);
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  writeText(REPORT_MD, buildMarkdown(report));
  console.log(JSON.stringify({
    ok: true,
    status: report.summary.status,
    challengeWindowCount: report.summary.challengeWindowCount,
    mediaBackedLateChallengeCount: report.summary.mediaBackedLateChallengeCount,
    challengeStageReadiness10: report.summary.challengeStageReadiness10,
    report: report.outputs.latest,
    markdown: report.outputs.markdown
  }, null, 2));
}

main();

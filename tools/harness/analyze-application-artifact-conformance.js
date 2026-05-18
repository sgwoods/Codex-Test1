#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const ANALYSES = path.join(ROOT, 'reference-artifacts', 'analyses');
const OUT_DIR = path.join(ANALYSES, 'application-artifact-conformance');
const OUT = path.join(OUT_DIR, 'latest.json');

const SOURCES = {
  spriteModel: 'reference-artifacts/analyses/galaga-reference-sprites/model-0.1.json',
  spriteTargets: 'reference-artifacts/analyses/galaga-reference-sprites/pixel-targets-0.1.json',
  spriteSheetTargetCrops: 'reference-artifacts/analyses/galaga-alien-target-crops/latest.json',
  runtimeSprite: 'reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest.json',
  runtimeVsTargetCrops: 'reference-artifacts/analyses/aurora-runtime-vs-galaga-target-crops/latest.json',
  audioLab: 'reference-artifacts/analyses/aurora-audio-conformance-lab-v2/latest.json',
  audioGap: 'reference-artifacts/analyses/aurora-audio-event-gap/latest.json',
  visualLook: 'reference-artifacts/analyses/aurora-visual-look-conformance/latest.json',
  releaseDashboard: 'reference-artifacts/analyses/release-conformance-dashboard/latest.json'
};

const AURORA_PIXEL_SPRITES = {
  'player-fighter': {
    label: 'Current Aurora player sprite',
    rows: ['..AA..', '.CBBC.', 'CABBAC', '.ABBA.', '..AA..'],
    colors: { A: '#9adfff', B: '#72c8ff', C: '#ff4658' }
  },
  'dual-fighter': {
    label: 'Current dual-fighter state',
    rows: ['..AA....AA..', '.CBBC..CBBC.', 'CABBACCABBAC', '.ABBA..ABBA.', '..AA....AA..'],
    colors: { A: '#9adfff', B: '#72c8ff', C: '#ff4658' }
  },
  'bee-line': {
    label: 'Current Aurora bee sprite',
    rows: ['...BB....', '.ABCCB.A.', 'AABBBB.AA', '.A.BB..A.', '..ACCBA..'],
    colors: { A: '#4e95ff', B: '#ffd24a', C: '#f08f2e' }
  },
  'but-line': {
    label: 'Current Aurora butterfly sprite',
    rows: ['...BB....', '.ABCCB.A.', 'AABBBB.AA', '.ABCCB.A.', '..ABBA..'],
    colors: { A: '#62a5ff', B: '#ff3d51', C: '#ffd25a' }
  },
  'boss-line': {
    label: 'Current Aurora boss sprite',
    rows: ['...CAAC..', '.AABBAA.', 'AABCCBAA', '.AABBAA.', '..ABBBA..'],
    colors: { A: '#60f0cf', B: '#5fe85c', C: '#cc5fff' }
  },
  'rogue-fighter': {
    label: 'Current Aurora rogue/captured-fighter sprite',
    rows: ['...CAAC..', '.AABBAA.', 'AABCCBAA', '.AABBAA.', '..ABBBA..'],
    colors: { A: '#a3cfff', B: '#ff5ea0', C: '#ffe36a' }
  },
  'challenge-dragonfly': {
    label: 'Current challenge dragonfly family',
    rows: ['.A...A.', '..BBB..', 'ABBCBBA', 'B.BBB.B', '..ACA..'],
    colors: { A: '#98ffab', B: '#94f0ff', C: '#ffe76f' }
  },
  'challenge-mosquito': {
    label: 'Current challenge mosquito family',
    rows: ['..A.A..', '.B.B.B.', 'BBCCBBB', '.ABCCA.', '..B.B..'],
    colors: { A: '#ffab85', B: '#ffe179', C: '#74f4ff' }
  }
};

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function exists(relPath){
  return !!relPath && fs.existsSync(path.join(ROOT, relPath));
}

function readJson(relPath){
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function readOptionalJson(relPath){
  return exists(relPath) ? readJson(relPath) : null;
}

function writeJson(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function rounded(value, places = 2){
  if(!Number.isFinite(+value)) return null;
  const scale = 10 ** places;
  return Math.round(+value * scale) / scale;
}

function scoreText(value){
  return Number.isFinite(+value) ? `${rounded(value, 1).toFixed(1).replace(/\.0$/, '')}/10` : 'unscored';
}

function percentText(value){
  return Number.isFinite(+value) ? `${Math.round(+value * 100)}%` : 'n/a';
}

function parseScore(value){
  const match = String(value || '').match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
  return match ? +match[1] : null;
}

function latestReport(artifact){
  const reports = [];
  const root = path.join(ANALYSES, artifact);
  function walk(dir){
    if(!fs.existsSync(dir)) return;
    for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
      const full = path.join(dir, entry.name);
      if(entry.isDirectory()) walk(full);
      else if(entry.isFile() && entry.name === 'report.json') reports.push(full);
    }
  }
  walk(root);
  reports.sort((a, b) => fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs || a.localeCompare(b));
  return reports.length ? rel(reports[reports.length - 1]) : null;
}

function git(args, fallback = ''){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function hexToRgb(hex){
  const clean = String(hex || '').replace(/^#/, '');
  if(!/^[0-9a-f]{6}$/i.test(clean)) return [0, 0, 0];
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16)
  ];
}

function colorSimilarity(a, b){
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.max(0, 1 - Math.sqrt(dr * dr + dg * dg + db * db) / Math.sqrt(255 * 255 * 3));
}

function tokenAtGrid(rows, colors, cols, gridRows, x, y){
  const srcRows = rows.length;
  const srcCols = rows.reduce((max, row) => Math.max(max, row.length), 0);
  const sx = Math.min(srcCols - 1, Math.floor(x * srcCols / cols));
  const sy = Math.min(srcRows - 1, Math.floor(y * srcRows / gridRows));
  const token = rows[sy]?.[sx] || '.';
  return {
    token,
    filled: token !== '.',
    rgb: token === '.' ? [0, 0, 0] : hexToRgb(colors[token] || '#ffffff')
  };
}

function compareSpriteToModel(spriteKey, sprite, model){
  const rows = Array.isArray(model.rows) ? model.rows : [];
  const cols = model.logicalGrid?.cols || rows.reduce((max, row) => Math.max(max, row.length), 0);
  const gridRows = model.logicalGrid?.rows || rows.length;
  const palette = model.palette || {};
  let silhouetteMatches = 0;
  let colorPairs = 0;
  let colorSum = 0;
  const total = Math.max(1, cols * gridRows);

  for(let y = 0; y < gridRows; y++){
    for(let x = 0; x < cols; x++){
      const current = tokenAtGrid(sprite.rows, sprite.colors, cols, gridRows, x, y);
      const targetToken = rows[y]?.[x] || '.';
      const target = {
        token: targetToken,
        filled: targetToken !== '.',
        rgb: targetToken === '.' ? [0, 0, 0] : hexToRgb(palette[targetToken] || '#ffffff')
      };
      if(current.filled === target.filled) silhouetteMatches++;
      if(current.filled && target.filled){
        colorPairs++;
        colorSum += colorSimilarity(current.rgb, target.rgb);
      }
    }
  }

  const silhouetteSimilarity = silhouetteMatches / total;
  const colorMatch = colorPairs ? colorSum / colorPairs : 0;
  const score10 = (silhouetteSimilarity * .65 + colorMatch * .35) * 10;
  return {
    spriteKey,
    currentLabel: sprite.label,
    targetId: model.id,
    targetLabel: model.label,
    score10: rounded(score10, 2),
    silhouetteSimilarity: rounded(silhouetteSimilarity, 3),
    colorSimilarity: rounded(colorMatch, 3),
    modelConfidence: rounded(model.averageConfidence || 0, 4),
    modelSamples: model.sampleCount || 0,
    modelImage: model.modelImage,
    sourcePixelTarget: model.sourcePixelTarget
  };
}

function buildSpriteComparison(spriteModel){
  const models = Array.isArray(spriteModel?.targets) ? spriteModel.targets : [];
  const comparisons = [];
  for(const [spriteKey, sprite] of Object.entries(AURORA_PIXEL_SPRITES)){
    const model = models.find(item => Array.isArray(item.catalogKeys) && item.catalogKeys.includes(spriteKey));
    if(!model) continue;
    comparisons.push(compareSpriteToModel(spriteKey, sprite, model));
  }
  const averageScore10 = comparisons.length
    ? rounded(comparisons.reduce((sum, item) => sum + item.score10, 0) / comparisons.length, 2)
    : null;
  const weakest = comparisons.slice().sort((a, b) => a.score10 - b.score10)[0] || null;
  return { comparisons, averageScore10, weakest };
}

function findGate(releaseDashboard, label){
  const gates = Array.isArray(releaseDashboard?.releaseGate) ? releaseDashboard.releaseGate : [];
  return gates.find(item => String(item.Gate || '').toLowerCase().includes(label.toLowerCase())) || null;
}

function row({ id, surface, current, target, score10, confidence, status, measurement, evidence, next }){
  const numericScore = score10 === null || score10 === undefined || score10 === ''
    ? null
    : Number.isFinite(+score10) ? rounded(score10, 2) : null;
  return {
    id,
    surface,
    current,
    target,
    score10: numericScore,
    confidence,
    status,
    measurement,
    evidence,
    next
  };
}

function main(){
  const spriteModel = readOptionalJson(SOURCES.spriteModel);
  const spriteTargets = readOptionalJson(SOURCES.spriteTargets);
  const spriteSheetTargetCrops = readOptionalJson(SOURCES.spriteSheetTargetCrops);
  const runtimeSprite = readOptionalJson(SOURCES.runtimeSprite);
  const runtimeVsTargetCrops = readOptionalJson(SOURCES.runtimeVsTargetCrops);
  const audioLab = readOptionalJson(SOURCES.audioLab);
  const audioGap = readOptionalJson(SOURCES.audioGap);
  const visualLook = readOptionalJson(SOURCES.visualLook);
  const releaseDashboard = readOptionalJson(SOURCES.releaseDashboard);
  const qualityReport = latestReport('quality-conformance');
  const quality = qualityReport ? readJson(qualityReport) : null;

  const spriteComparison = buildSpriteComparison(spriteModel);
  const runtimeSpriteSummary = runtimeSprite?.summary || {};
  const runtimeSpriteSamples = Array.isArray(runtimeSprite?.samples) ? runtimeSprite.samples : [];
  const runtimeWeakest = runtimeSpriteSamples.slice().sort((a, b) => (a.score10 || 0) - (b.score10 || 0))[0] || null;
  const runtimeVsTargetSummary = runtimeVsTargetCrops?.summary || {};
  const audioGate = findGate(releaseDashboard, 'audio identity');
  const visualGate = findGate(releaseDashboard, 'visual look');
  const frameGate = findGate(releaseDashboard, 'arcade frame');
  const levelGate = findGate(releaseDashboard, 'level arc');
  const bossGate = findGate(releaseDashboard, 'boss entry');
  const alienNoveltyGate = findGate(releaseDashboard, 'alien entry and challenge');
  const visualSummary = visualLook?.summary || {};
  const audioLabSummary = audioLab?.summary || {};
  const audioGapSummary = audioGap?.summary || {};
  const sourceTargetCatalogKeys = spriteTargets?.summary?.catalogKeys || [];
  const sourceTargetCount = spriteTargets?.summary?.targetCount || 0;
  const sheetTargetCropSummary = spriteSheetTargetCrops?.summary || {};
  const sheetTargetRoleSets = Array.isArray(spriteSheetTargetCrops?.roleSets) ? spriteSheetTargetCrops.roleSets : [];
  const sheetTargetRoles = sheetTargetRoleSets.map(role => role.roleKey).filter(Boolean);
  const sheetTargetCropCount = sheetTargetCropSummary.targetCropCount || (Array.isArray(spriteSheetTargetCrops?.targetCrops) ? spriteSheetTargetCrops.targetCrops.length : 0);
  const sheetTargetRoleCount = sheetTargetCropSummary.roleSetCount || sheetTargetRoleSets.length;
  const surfaceCheckCount = quality?.surfaceRun?.checks?.length || 0;
  const audioAlignment = quality?.audioAlignmentRun?.summary || quality?.audioAlignmentRun || {};

  const rows = [
    row({
      id: 'sprite-model-current-vs-target',
      surface: 'Sprites: docs catalog proxy vs inferred Galaga pixel models',
      current: scoreText(spriteComparison.averageScore10),
      target: '>=8.5/10 as a fast docs/current-definition proxy',
      score10: spriteComparison.averageScore10,
      confidence: 'medium-low',
      status: 'Measured proxy; keep alongside live runtime canvas score',
      measurement: `${spriteComparison.comparisons.length} catalog keys compared; model confidence ${percentText(spriteModel?.summary?.averageConfidence)} from ${spriteModel?.summary?.totalSamples || 0} accepted source samples; weakest current proxy ${spriteComparison.weakest?.spriteKey || 'n/a'} ${scoreText(spriteComparison.weakest?.score10)}.`,
      evidence: `${SOURCES.spriteModel}; ${SOURCES.spriteTargets}`,
      next: 'Use this as the cheap warning metric when docs/current definitions drift from the target model; the runtime canvas metric is the player-visible read.'
    }),
    row({
      id: 'sprite-runtime-canvas-vs-target',
      surface: 'Sprites: live runtime canvas capture vs inferred Galaga pixel models',
      current: scoreText(runtimeSpriteSummary.averageScore10),
      target: '>=8.5/10 against isolated live-rendered canvas captures',
      score10: runtimeSpriteSummary.averageScore10,
      confidence: runtimeSprite ? 'medium' : 'pending',
      status: runtimeSprite ? 'Measured from isolated live canvas crops' : 'Runtime canvas artifact pending',
      measurement: runtimeSprite
        ? `${runtimeSpriteSummary.sampleCount || runtimeSpriteSamples.length} live sprite captures; weakest runtime sprite ${runtimeWeakest?.spriteKey || runtimeSpriteSummary.weakestSpriteKey || 'n/a'} ${scoreText(runtimeWeakest?.score10 || runtimeSpriteSummary.weakestScore10)}; capture mode ${runtimeSpriteSummary.captureMode || 'runtime-canvas'}.`
        : 'Run npm run harness:analyze:aurora-runtime-sprite-conformance to capture live-rendered sprite crops.',
      evidence: runtimeSprite ? SOURCES.runtimeSprite : SOURCES.spriteModel,
      next: 'Expand from static isolated poses into animation-phase, dive-rotation, formation-context, and capture/rescue runtime sprite windows.'
    }),
    row({
      id: 'sprite-runtime-vs-promoted-target-crops',
      surface: 'Sprites: live runtime crops vs promoted Galaga target crops',
      current: runtimeVsTargetCrops ? scoreText(runtimeVsTargetSummary.averageScore10) : 'direct target-crop comparison pending',
      target: '>=8.5/10 against promoted multi-pose target crop library',
      score10: runtimeVsTargetSummary.averageScore10,
      confidence: runtimeVsTargetCrops ? 'medium-low' : 'pending',
      status: runtimeVsTargetCrops
        ? (runtimeVsTargetSummary.scoringMode || 'first-pass normalized image-grid comparison')
        : 'Direct runtime-vs-promoted-target-crop artifact pending',
      measurement: runtimeVsTargetCrops
        ? `${runtimeVsTargetSummary.sampleCount || 0} live runtime crop PNGs compared against ${runtimeVsTargetSummary.targetCropCount || 0} promoted target crops; weakest ${runtimeVsTargetSummary.weakestSpriteKey || 'n/a'} ${scoreText(runtimeVsTargetSummary.weakestScore10)}; best matched target ${runtimeVsTargetSummary.weakestBestTarget || 'n/a'}.`
        : 'Run npm run harness:analyze:aurora-runtime-vs-galaga-target-crops after runtime sprite crops and target crops exist.',
      evidence: runtimeVsTargetCrops ? SOURCES.runtimeVsTargetCrops : `${SOURCES.runtimeSprite}; ${SOURCES.spriteSheetTargetCrops}`,
      next: 'Use the top candidate mismatch data to update sprite geometry, target mappings, and composite targets; then add temporal windows for flap, dive, capture/rescue, projectile, explosion, tractor beam, and challenge-stage specialty motion.'
    }),
    row({
      id: 'sprite-motion-animation-coverage',
      surface: 'Sprite motion: flapping, pulsing, dive poses, and transition animation',
      current: runtimeSprite
        ? `${runtimeSpriteSummary.motionCoverageAxesCovered || 0}/${runtimeSpriteSummary.motionCoverageAxesPlanned || 4} planned motion axes covered`
        : 'motion coverage pending',
      target: 'Temporal sprite score across flap cadence, pulse/damage phases, dive rotation, and capture/rescue transitions',
      score10: null,
      confidence: 'planning',
      status: 'Not yet scored; current sprite metrics are static-pose measurements',
      measurement: runtimeSprite
        ? `Static live-canvas pose score exists at ${scoreText(runtimeSpriteSummary.averageScore10)}; motion axes still pending: ${(runtimeSpriteSummary.plannedMotionAxes || []).join('; ')}.`
        : 'Runtime sprite artifact has not been generated, so motion coverage cannot be planned from the current capture set yet.',
      evidence: runtimeSprite ? SOURCES.runtimeSprite : SOURCES.spriteModel,
      next: 'Add harness windows for flap cycle A/B frames, pulse and damage-state timing, dive-rotation silhouettes, and carried/rescue/dual-fighter transition frames before treating sprite conformance as visually complete.'
    }),
    row({
      id: 'source-frame-pixel-targets',
      surface: 'Reference sprite targets: source-frame pixel library',
      current: `${sourceTargetCatalogKeys.length} catalog keys covered by ${sourceTargetCount} exact crops`,
      target: 'All live ship/enemy catalog keys covered by source-frame targets',
      score10: sourceTargetCatalogKeys.length >= 8 ? 10 : sourceTargetCatalogKeys.length / 8 * 10,
      confidence: 'high',
      status: 'Source-frame pixel targets promoted',
      measurement: `${sourceTargetCount} unscaled PNG crops cover ${sourceTargetCatalogKeys.join(', ')}; target dimensions are verified against crop metadata.`,
      evidence: SOURCES.spriteTargets,
      next: 'Add additional formation, animation-phase, and damage-state crops so target references cover more than the static catalog poses.'
    }),
    row({
      id: 'sprite-sheet-target-pose-crops',
      surface: 'Reference sprite targets: promoted sheet pose crops',
      current: spriteSheetTargetCrops
        ? `${sheetTargetCropCount} promoted crops across ${sheetTargetRoleCount} role sets`
        : 'promoted target crops pending',
      target: 'Multi-pose target sets for player, bee, butterfly, boss, challenge aliens, projectiles, explosions, and tractor beam',
      score10: null,
      confidence: spriteSheetTargetCrops ? 'medium' : 'pending',
      status: spriteSheetTargetCrops
        ? `First-pass source-sheet target library; ${sheetTargetCropSummary.scoringStatus || 'runtime comparison pending'}`
        : 'Target crop promotion not generated',
      measurement: spriteSheetTargetCrops
        ? `${sheetTargetCropCount} exact 1x source-sheet crops; roles ${sheetTargetRoles.join(', ') || 'n/a'}; source-pixel exact ${sheetTargetCropSummary.sourcePixelExact ? 'yes' : 'pending'}.`
        : 'Run npm run harness:promote:galaga-alien-target-crops to generate the target crop library.',
      evidence: spriteSheetTargetCrops ? SOURCES.spriteSheetTargetCrops : SOURCES.spriteTargets,
      next: spriteSheetTargetCrops?.nextBestStep || 'Compare Aurora runtime crops against the promoted multi-pose target crop library and add temporal scoring windows.'
    }),
    row({
      id: 'audio-cue-assets',
      surface: 'Audio cues: runtime cue assets vs Galaga-family references',
      current: audioGate?.Current || scoreText(audioLabSummary.audioScore10),
      target: audioGate?.Target || '>=7.5/10',
      score10: parseScore(audioGate?.Current) || audioLabSummary.audioScore10,
      confidence: 'medium-high',
      status: audioGate?.Notes || 'Measured release category',
      measurement: `${audioGapSummary.comparedCueCount || 0} cue/event comparisons, ${audioGapSummary.segmentRoleComparisonCount || 0} segment-role comparisons, semantic score ${scoreText(audioGapSummary.semanticAverageScore10)}, highest risk ${audioGapSummary.highestRiskCue || audioLabSummary.highestRiskCue || 'n/a'} ${scoreText(audioGapSummary.highestRisk10 || audioLabSummary.highestRisk10)}.`,
      evidence: `${SOURCES.audioLab}; ${SOURCES.audioGap}${qualityReport ? `; ${qualityReport}` : ''}`,
      next: audioLabSummary.nextGap || 'Tune the highest-risk cue, then rerun audio comparison and event-gap analysis.'
    }),
    row({
      id: 'audio-event-alignment',
      surface: 'Audio timing and event alignment',
      current: `${audioAlignment.passed || 0}/${audioAlignment.total || 0} checks passed`,
      target: 'All event-alignment checks pass with low drift',
      score10: audioAlignment.total ? audioAlignment.passed / audioAlignment.total * 10 : null,
      confidence: 'medium',
      status: 'Guardrail measured in quality conformance',
      measurement: `Worst current delta ${Number.isFinite(+audioAlignment.worstCurrentDelta) ? rounded(audioAlignment.worstCurrentDelta, 2) : 'n/a'} ms; worst drift from baseline ${Number.isFinite(+audioAlignment.worstDriftFromBaseline) ? rounded(audioAlignment.worstDriftFromBaseline, 2) : 'n/a'} ms.`,
      evidence: qualityReport || SOURCES.audioGap,
      next: 'Keep event alignment coupled to the cue-contract promotion pass so timing does not regress while changing source clips.'
    }),
    row({
      id: 'backgrounds-starfield-atmosphere',
      surface: 'Backgrounds, starfield, and arcade atmosphere',
      current: visualGate?.Current || scoreText(visualSummary.score10),
      target: visualGate?.Target || '>=8.4/10',
      score10: parseScore(visualGate?.Current) || visualSummary.score10,
      confidence: visualSummary.confidence || 'medium-low',
      status: visualGate?.Notes || 'First-pass visual scorer measured',
      measurement: `${visualSummary.surfaceCount || 0} browser surfaces measured; evidence coverage ${visualSummary.evidenceCoverage ?? 'n/a'}; frame containment average ${visualSummary.frameContainmentAverage ?? 'n/a'}; weakest surface ${visualSummary.weakestSurface?.label || 'n/a'} ${scoreText(visualSummary.weakestSurface?.score10)}.`,
      evidence: SOURCES.visualLook,
      next: 'Add direct Galaga contact-sheet targets for background density, starfield cadence, palette spread, and attract/gameplay contrast.'
    }),
    row({
      id: 'frame-popup-icon-shell',
      surface: 'Frame, popups, shell controls, and icons',
      current: frameGate?.Current || 'surface guardrails pass',
      target: frameGate?.Target || '>=9.4/10',
      score10: parseScore(frameGate?.Current),
      confidence: 'medium',
      status: frameGate?.Notes || 'Surface harnesses pass',
      measurement: `${surfaceCheckCount} surface guardrails in latest quality report; visual scorer weakest shell surface ${visualSummary.weakestSurface?.label || 'n/a'} ${scoreText(visualSummary.weakestSurface?.score10)}.`,
      evidence: `${SOURCES.releaseDashboard}${qualityReport ? `; ${qualityReport}` : ''}; ${SOURCES.visualLook}`,
      next: 'Split iconography, dock-button affordance, and popup typography into separate target rows once we have icon/font-specific captures.'
    }),
    row({
      id: 'fonts-text-containment',
      surface: 'Fonts, typography, and text containment',
      current: scoreText(visualSummary.weakestSurface?.score10),
      target: '>=8.4/10 visual gate; font-authenticity target still pending',
      score10: visualSummary.weakestSurface?.score10,
      confidence: visualSummary.confidence || 'medium-low',
      status: 'Measured as layout/text containment, not yet arcade font identity',
      measurement: `${visualSummary.overflowCount || 0} overflow markers across ${visualSummary.surfaceCount || 0} surfaces; weakest text-heavy surface ${visualSummary.weakestSurface?.label || 'n/a'} at ${scoreText(visualSummary.weakestSurface?.score10)}.`,
      evidence: SOURCES.visualLook,
      next: 'Add pixel-font targets for score labels, score-table labels, popup headings, and HUD numerals so font authenticity gets its own score.'
    }),
    row({
      id: 'level-background-encounter-shape',
      surface: 'Stage backgrounds, level arc, and encounter shape',
      current: levelGate?.Current || 'unscored',
      target: levelGate?.Target || '>=8.8/10',
      score10: parseScore(levelGate?.Current),
      confidence: 'medium',
      status: levelGate?.Notes || 'Long-play gameplay-quality gate',
      measurement: `Release gate tracks stage distinctiveness, challenge identity, pressure curve, reward/rescue layering, and learning/mastery windows.`,
      evidence: SOURCES.releaseDashboard,
      next: 'Tie visual background/theme transitions to the level-arc windows so stage identity scores include both motion and look.'
    }),
    row({
      id: 'boss-formation-choreography',
      surface: 'Bosses, formation grammar, and alien entry choreography',
      current: bossGate?.Current || 'unscored',
      target: bossGate?.Target || '>=9.0 mature',
      score10: parseScore(bossGate?.Current),
      confidence: 'medium',
      status: bossGate?.Notes || 'Formation scorer measured',
      measurement: `Companion novelty gate ${alienNoveltyGate?.Current || 'unscored'} for broader alien entry/challenge variety.`,
      evidence: SOURCES.releaseDashboard,
      next: 'Continue frame-labeled path references so boss and alien choreography can be judged against exact source trajectories.'
    })
  ];

  const numericRows = rows.filter(item => item.score10 !== null && Number.isFinite(+item.score10));
  const artifact = {
    schemaVersion: 1,
    artifactType: 'application-artifact-conformance-status',
    generatedAt: new Date().toISOString(),
    commit: git(['rev-parse', '--short', 'HEAD'], 'unknown'),
    branch: git(['branch', '--show-current'], 'unknown'),
    dirty: !!git(['status', '--porcelain'], ''),
    sources: Object.assign({}, SOURCES, qualityReport ? { qualityReport } : {}),
    summary: {
      rowCount: rows.length,
      numericRowCount: numericRows.length,
      averageScore10: numericRows.length
        ? rounded(numericRows.reduce((sum, item) => sum + item.score10, 0) / numericRows.length, 2)
        : null,
      weakestRow: numericRows.slice().sort((a, b) => a.score10 - b.score10)[0]?.id || null,
      spriteCatalogProxyScore10: spriteComparison.averageScore10,
      spriteRuntimeCanvasScore10: runtimeSpriteSummary.averageScore10 || null,
      spriteRuntimeVsTargetCropScore10: runtimeVsTargetSummary.averageScore10 || null,
      spriteModelAverageConfidence: rounded(spriteModel?.summary?.averageConfidence || 0, 4),
      audioScore10: audioLabSummary.audioScore10 || parseScore(audioGate?.Current),
      visualScore10: visualSummary.score10 || parseScore(visualGate?.Current),
      framePopupScore10: parseScore(frameGate?.Current),
      fontTextWeakestSurfaceScore10: visualSummary.weakestSurface?.score10 || null
    },
    measurementLimits: [
      'Sprite rows intentionally include both a docs/catalog proxy and a live runtime-canvas score; they answer different questions and should not be collapsed.',
      'The promoted-target-crop runtime row is a first-pass static image-grid comparison against exact source-sheet crops; it is deliberately stricter and currently exposes a larger visual gap than the inferred-model runtime score.',
      'Sprite conformance is not complete until temporal behavior is measured. Current sprite scores isolate static poses; animation phases, flapping cadence, pulsing, rotations, dive poses, capture/rescue transitions, and formation context still need their own windows.',
      'Fonts are measured through text containment and text-heavy visual surface scoring; arcade font identity still needs dedicated pixel targets.',
      'Background and shell scores use the first-pass visual scorer plus release gates; direct Galaga contact-sheet metrics are the next fidelity step.'
    ],
    spriteComparisons: spriteComparison.comparisons,
    runtimeSpriteComparisons: runtimeSpriteSamples,
    runtimeVsTargetCropComparisons: Array.isArray(runtimeVsTargetCrops?.comparisons) ? runtimeVsTargetCrops.comparisons : [],
    spriteSheetTargetCrops: spriteSheetTargetCrops ? {
      summary: sheetTargetCropSummary,
      roleSets: sheetTargetRoleSets,
      targetCropCount: sheetTargetCropCount,
      roleSetCount: sheetTargetRoleCount
    } : null,
    rows
  };

  writeJson(OUT, artifact);
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    rowCount: artifact.summary.rowCount,
    averageScore10: artifact.summary.averageScore10,
    weakestRow: artifact.summary.weakestRow,
    spriteCatalogProxyScore10: artifact.summary.spriteCatalogProxyScore10,
    spriteRuntimeCanvasScore10: artifact.summary.spriteRuntimeCanvasScore10,
    audioScore10: artifact.summary.audioScore10,
    visualScore10: artifact.summary.visualScore10
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack || String(err));
}

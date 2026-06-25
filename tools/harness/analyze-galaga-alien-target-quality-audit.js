#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-alien-target-quality-audit');
const OUT = path.join(OUT_DIR, 'latest.json');
const CONTACT_SHEET = path.join(OUT_DIR, 'latest-contact-sheet.svg');
const REPORT = path.join(OUT_DIR, 'latest.md');

const TARGET_CROPS = 'reference-artifacts/analyses/galaga-alien-target-crops/latest.json';
const TARGET_EVIDENCE_AUDIT = 'reference-artifacts/analyses/galaga-target-evidence-audit/latest.json';
const MODEL = 'reference-artifacts/analyses/galaga-reference-sprites/model-0.1.json';
const RUNTIME = 'reference-artifacts/analyses/aurora-runtime-sprite-conformance/latest.json';
const RUNTIME_VS_TARGET = 'reference-artifacts/analyses/aurora-runtime-vs-galaga-target-crops/latest.json';
const TEMPORAL_TARGETS = 'reference-artifacts/analyses/galaga-alien-temporal-targets/latest.json';
const CADENCE_TARGETS = 'reference-artifacts/analyses/galaga-alien-frame-cadence-targets/latest.json';

const ROLE_SPECS = [
  {
    roleKey: 'boss-galaga',
    label: 'Boss Galaga',
    runtimeSpriteKeys: ['boss-line'],
    modelKeys: ['boss-line'],
    targetRoleKeys: ['boss-galaga'],
    minimumTargetAuthorityScore10: 7,
    releaseTargetExpectation: 'trusted formation/pulse target plus explicit caveat that the compact model rows are not ROM-perfect'
  },
  {
    roleKey: 'bee-zako',
    label: 'Bee / Zako',
    runtimeSpriteKeys: ['bee-line'],
    modelKeys: ['bee-line'],
    targetRoleKeys: ['bee-zako'],
    minimumTargetAuthorityScore10: 7,
    releaseTargetExpectation: 'trusted formation target and provisional pose targets'
  },
  {
    roleKey: 'butterfly-escort',
    label: 'Butterfly / Escort',
    runtimeSpriteKeys: ['but-line'],
    modelKeys: ['but-line'],
    targetRoleKeys: ['butterfly-escort'],
    minimumTargetAuthorityScore10: 7,
    releaseTargetExpectation: 'trusted formation target and provisional pose targets'
  },
  {
    roleKey: 'challenge-specialty-aliens',
    label: 'Challenge Specialty Aliens',
    runtimeSpriteKeys: ['challenge-dragonfly', 'challenge-mosquito'],
    modelKeys: ['challenge-dragonfly', 'challenge-mosquito'],
    targetRoleKeys: ['challenge-specialty-aliens'],
    minimumTargetAuthorityScore10: 7,
    releaseTargetExpectation: 'not release-ready until clean challenge-stage target windows replace planning-only sheet cells'
  }
];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function readJson(relPath, fallback = null){
  try{
    return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
  }catch{
    return fallback;
  }
}

function writeJson(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${String(value).replace(/\r\n/g, '\n').trimEnd()}\n`);
}

function exists(relPath){
  return !!relPath && fs.existsSync(path.join(ROOT, relPath));
}

function git(args, fallback = ''){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function round(value, places = 2){
  if(!Number.isFinite(+value)) return null;
  const scale = 10 ** places;
  return Math.round(+value * scale) / scale;
}

function byId(items, key = 'id'){
  return new Map((Array.isArray(items) ? items : []).map(item => [item[key], item]));
}

function modelForKey(model, key){
  return (model.targets || []).find(target => (target.catalogKeys || []).includes(key)) || null;
}

function auditRowForRole(audit, roleKey){
  return (audit.rows || []).find(row => row.roleKey === roleKey) || null;
}

function targetCropsForRole(targetCrops, roleKeys){
  return (targetCrops.targetCrops || []).filter(crop => roleKeys.includes(crop.roleKey));
}

function runtimeSample(runtime, spriteKey){
  return (runtime.samples || []).find(sample => sample.spriteKey === spriteKey) || null;
}

function comparisonForSprite(runtimeVsTarget, spriteKey){
  return (runtimeVsTarget.comparisons || []).find(comparison => comparison.spriteKey === spriteKey) || null;
}

function cadenceRowsForSprites(cadence, spriteKeys){
  return (cadence.rows || cadence.summary?.rows || []).filter(row => spriteKeys.includes(row.runtimeSpriteKey));
}

function temporalRowsForSprites(temporal, spriteKeys){
  return (temporal.rows || []).filter(row => spriteKeys.includes(row.runtimeSpriteKey));
}

function confidenceLabel(score){
  if(score >= 7) return 'trusted';
  if(score >= 5) return 'mixed';
  if(score >= 3.5) return 'weak';
  return 'provisional';
}

function targetImageAvailability(crops){
  const targetImages = crops.map(crop => crop.targetCrop).filter(Boolean);
  const available = targetImages.filter(exists);
  return {
    targetImageCount: targetImages.length,
    availableTargetImageCount: available.length,
    missingTargetImages: targetImages.filter(item => !exists(item))
  };
}

function modelSupport(modelTargets){
  const sampleCounts = modelTargets.map(target => +(target?.sampleCount || 0)).filter(Number.isFinite);
  const confidence = modelTargets.map(target => +(target?.averageConfidence || 0)).filter(Number.isFinite);
  return {
    modelCount: modelTargets.length,
    minimumSampleCount: sampleCounts.length ? Math.min(...sampleCounts) : 0,
    averageSampleCount: sampleCounts.length ? round(sampleCounts.reduce((sum, value) => sum + value, 0) / sampleCounts.length, 2) : 0,
    averageConfidence: confidence.length ? round(confidence.reduce((sum, value) => sum + value, 0) / confidence.length, 3) : 0,
    weakModelSupport: sampleCounts.some(value => value < 3)
  };
}

function roleQuality(spec, artifacts){
  const crops = targetCropsForRole(artifacts.targetCrops, spec.targetRoleKeys);
  const trusted = crops.filter(crop => String(crop.authorityStatus || '').includes('trusted') || crop.videoDerivedCleanCrop);
  const provisional = crops.filter(crop => String(crop.authorityStatus || '').includes('planning') || String(crop.reviewStatus || '').includes('provisional'));
  const authorities = crops.map(crop => +crop.authorityScore10).filter(Number.isFinite);
  const averageAuthorityScore10 = authorities.length ? round(authorities.reduce((sum, value) => sum + value, 0) / authorities.length, 2) : null;
  const bestAuthorityScore10 = authorities.length ? round(Math.max(...authorities), 2) : null;
  const auditRow = auditRowForRole(artifacts.audit, spec.roleKey);
  const modelTargets = spec.modelKeys.map(key => modelForKey(artifacts.model, key)).filter(Boolean);
  const support = modelSupport(modelTargets);
  const comparisons = spec.runtimeSpriteKeys.map(key => comparisonForSprite(artifacts.runtimeVsTarget, key)).filter(Boolean);
  const runtimeSamples = spec.runtimeSpriteKeys.map(key => runtimeSample(artifacts.runtime, key)).filter(Boolean);
  const comparisonScores = comparisons.map(item => +item.bestScore10).filter(Number.isFinite);
  const adjustedScores = comparisons.map(item => +item.authorityAdjustedScore10).filter(Number.isFinite);
  const temporalRows = temporalRowsForSprites(artifacts.temporal, spec.runtimeSpriteKeys);
  const cadenceRows = cadenceRowsForSprites(artifacts.cadence, spec.runtimeSpriteKeys);
  const imageAvailability = targetImageAvailability(crops);
  const issues = [];
  if(!crops.length) issues.push('missing target crops');
  if((bestAuthorityScore10 || 0) < spec.minimumTargetAuthorityScore10) issues.push('no release-grade target authority');
  if(!trusted.length) issues.push('no trusted video-derived target crop');
  if(support.weakModelSupport) issues.push('compact/inferred model support is thin');
  if(imageAvailability.availableTargetImageCount < imageAvailability.targetImageCount) issues.push('one or more target crop PNGs are private or unavailable locally');
  if(!temporalRows.length) issues.push('missing temporal target sequence');
  if(!cadenceRows.length) issues.push('missing frame cadence target sequence');
  const status = issues.includes('no release-grade target authority') || issues.includes('no trusted video-derived target crop')
    ? 'target-quality-blocked'
    : issues.length
      ? 'target-quality-usable-with-caveats'
      : 'target-quality-usable';
  const qualityScore10 = round(
    ((bestAuthorityScore10 || 0) * .32)
    + (Math.min(10, (trusted.length / Math.max(1, crops.length)) * 10) * .18)
    + (Math.min(10, support.averageSampleCount * 2) * .16)
    + (Math.min(10, temporalRows.length * 5) * .12)
    + (Math.min(10, cadenceRows.length * 5) * .12)
    + ((adjustedScores.length ? adjustedScores.reduce((sum, value) => sum + value, 0) / adjustedScores.length : 0) * .10),
    2
  );
  return {
    roleKey: spec.roleKey,
    label: spec.label,
    status,
    qualityScore10,
    confidence: confidenceLabel(qualityScore10),
    releaseTargetExpectation: spec.releaseTargetExpectation,
    targetCropCount: crops.length,
    trustedTargetCropCount: trusted.length,
    provisionalTargetCropCount: provisional.length,
    averageAuthorityScore10,
    bestAuthorityScore10,
    auditStatus: auditRow?.status || '',
    modelSupport: support,
    runtime: runtimeSamples.map(sample => ({
      spriteKey: sample.spriteKey,
      cropImage: sample.cropImage,
      runtimeModelScore10: sample.score10,
      silhouetteSimilarity: sample.silhouetteSimilarity,
      colorSimilarity: sample.colorSimilarity
    })),
    runtimeVsTarget: comparisons.map(comparison => ({
      spriteKey: comparison.spriteKey,
      bestTargetCropId: comparison.bestTargetCropId || comparison.bestTarget || '',
      bestTargetCrop: comparison.bestTargetCrop,
      bestScore10: comparison.bestScore10,
      bestTargetAuthorityScore10: comparison.bestTargetAuthorityScore10,
      authorityAdjustedScore10: comparison.authorityAdjustedScore10,
      topCandidates: (comparison.topCandidates || []).slice(0, 3).map(candidate => ({
        targetCropId: candidate.targetCropId,
        score10: candidate.score10,
        targetAuthorityScore10: candidate.targetAuthorityScore10,
        targetAuthorityStatus: candidate.targetAuthorityStatus
      }))
    })),
    temporalTargetRows: temporalRows.map(row => ({
      id: row.id,
      runtimeSpriteKey: row.runtimeSpriteKey,
      status: row.status || row.targetTimingStatus || '',
      frameCount: row.frames?.length || row.frameCount || null
    })),
    cadenceTargetRows: cadenceRows.map(row => ({
      id: row.id,
      runtimeSpriteKey: row.runtimeSpriteKey,
      sampleCount: row.sampleCount,
      phaseLabels: row.phaseLabels || []
    })),
    imageAvailability,
    targetCrops: crops.map(crop => ({
      id: crop.id,
      roleKey: crop.roleKey,
      poseKey: crop.poseKey,
      targetCrop: crop.targetCrop,
      targetCropExists: exists(crop.targetCrop),
      sourceKind: crop.sourceKind,
      reviewStatus: crop.reviewStatus,
      authorityStatus: crop.authorityStatus,
      authorityScore10: crop.authorityScore10,
      videoDerivedCleanCrop: !!crop.videoDerivedCleanCrop,
      sourcePixelExact: !!crop.sourcePixelExact,
      metrics: crop.metrics || null
    })),
    issues
  };
}

function svgEsc(value){
  return String(value ?? '').replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}

function encodeImage(relPath){
  if(!exists(relPath)) return null;
  const ext = path.extname(relPath).toLowerCase();
  const mime = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.svg' ? 'image/svg+xml' : 'image/png';
  return `data:${mime};base64,${fs.readFileSync(path.join(ROOT, relPath)).toString('base64')}`;
}

function renderModelSvg(modelTarget, x, y, cell = 4){
  if(!modelTarget) return `<text class="muted" x="${x}" y="${y + 16}">No model rows</text>`;
  const rows = modelTarget.rows || [];
  const palette = modelTarget.palette || {};
  let out = `<rect x="${x}" y="${y}" width="132" height="132" fill="#0f1218" stroke="#2c3544"/>`;
  for(let yy = 0; yy < rows.length; yy++){
    const row = String(rows[yy] || '');
    for(let xx = 0; xx < row.length; xx++){
      const token = row[xx];
      if(token === '.' || token === ' ') continue;
      out += `<rect x="${x + 8 + xx * cell}" y="${y + 8 + yy * cell}" width="${cell}" height="${cell}" fill="${svgEsc(palette[token] || '#ff00ff')}"/>`;
    }
  }
  return out;
}

function imageOrPlaceholder(relPath, x, y, width, height, label){
  const data = encodeImage(relPath);
  if(data){
    return `<image href="${data}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/>`;
  }
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#141820" stroke="#3c4658"/>
<text class="muted" x="${x + 8}" y="${y + 22}">${svgEsc(label || 'image unavailable')}</text>
<text class="tiny" x="${x + 8}" y="${y + 40}">${svgEsc(relPath || 'missing path')}</text>`;
}

function renderContactSheet(rows, artifacts){
  const rowH = 190;
  const width = 1060;
  const height = 86 + rows.length * rowH + 48;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">
<style>
text{font-family:Menlo,Consolas,monospace;font-size:13px;fill:#eef5ff}
.muted{fill:#b8c3d4;font-size:11px}
.tiny{fill:#8793a6;font-size:9px}
.warn{fill:#ffd37a}
.blocked{fill:#ff8c8c}
image{image-rendering:pixelated}
</style>
<rect width="100%" height="100%" fill="#101216"/>
<text x="18" y="28">Galaga Alien Target Quality Audit</text>
<text class="muted" x="18" y="48">Target authority, model support, runtime-vs-target result, and local image availability before further sprite tuning.</text>
<text class="muted" x="18" y="66">Generated from ${svgEsc(RUNTIME_VS_TARGET)}, ${svgEsc(TARGET_CROPS)}, and runtime sprite crops.</text>`;
  rows.forEach((row, index) => {
    const y = 88 + index * rowH;
    const statusClass = row.status === 'target-quality-blocked' ? 'blocked' : row.status === 'target-quality-usable-with-caveats' ? 'warn' : 'muted';
    const modelTarget = artifacts.model.targets?.find(target => (target.catalogKeys || []).includes(row.modelSupport.modelCount ? ROLE_SPECS.find(spec => spec.roleKey === row.roleKey)?.modelKeys?.[0] : ''));
    const runtimeImage = row.runtime[0]?.cropImage || '';
    const bestTarget = row.runtimeVsTarget[0]?.bestTargetCrop || row.targetCrops[0]?.targetCrop || '';
    svg += `<rect x="18" y="${y}" width="${width - 36}" height="${rowH - 14}" fill="#151922" stroke="#293140"/>
<text x="32" y="${y + 24}">${svgEsc(row.label)}</text>
<text class="${statusClass}" x="32" y="${y + 44}">${svgEsc(row.status)} | quality ${row.qualityScore10}/10 | authority ${row.bestAuthorityScore10 ?? 'n/a'}/10</text>
<text class="muted" x="32" y="${y + 64}">trusted ${row.trustedTargetCropCount}/${row.targetCropCount}; model samples min ${row.modelSupport.minimumSampleCount}; temporal ${row.temporalTargetRows.length}; cadence ${row.cadenceTargetRows.length}</text>
<text class="tiny" x="32" y="${y + 84}">${svgEsc(row.issues.join('; ') || 'no target-quality issues')}</text>
<text class="muted" x="300" y="${y + 22}">Best target crop</text>
${imageOrPlaceholder(bestTarget, 300, y + 34, 150, 120, 'target crop private/missing')}
<text class="muted" x="476" y="${y + 22}">Inferred model rows</text>
${renderModelSvg(modelTarget, 476, y + 34, 3)}
<text class="muted" x="636" y="${y + 22}">Runtime crop</text>
${imageOrPlaceholder(runtimeImage, 636, y + 34, 150, 120, 'runtime crop missing')}
<text class="muted" x="814" y="${y + 22}">Runtime vs target</text>
<text class="muted" x="814" y="${y + 46}">best ${row.runtimeVsTarget[0]?.bestScore10 ?? 'n/a'}/10</text>
<text class="muted" x="814" y="${y + 66}">adjusted ${row.runtimeVsTarget[0]?.authorityAdjustedScore10 ?? 'n/a'}/10</text>
<text class="muted" x="814" y="${y + 86}">target ${svgEsc(row.runtimeVsTarget[0]?.bestTargetCropId || row.targetCrops[0]?.id || 'n/a')}</text>
<text class="tiny" x="814" y="${y + 112}">${svgEsc(row.releaseTargetExpectation)}</text>`;
  });
  svg += `<text class="tiny" x="18" y="${height - 20}">A private/missing target image is not necessarily a broken artifact; it means this public worktree cannot visually inspect that target without private artifact provisioning.</text>
</svg>
`;
  return svg;
}

function markdown(artifact){
  const lines = [
    '# Galaga Alien Target Quality Audit',
    '',
    `Generated: ${artifact.generatedAt}`,
    '',
    'Purpose: make target quality visible before sprite tuning. A runtime sprite can score well against a weak target, so this audit separates source/target authority from runtime conformance.',
    '',
    '## Summary',
    '',
    `- Status: ${artifact.status}`,
    `- Audited roles: ${artifact.summary.roleCount}`,
    `- Usable with caveats: ${artifact.summary.usableWithCaveatsCount}`,
    `- Blocked targets: ${artifact.summary.blockedCount}`,
    `- Lowest quality role: ${artifact.summary.lowestQualityRoleKey} (${artifact.summary.lowestQualityScore10}/10)`,
    `- Contact sheet: \`${artifact.contactSheet}\``,
    '',
    '## Role Readout',
    '',
    '| Role | Status | Quality | Authority | Key Issues | Next Measurement Step |',
    '| --- | --- | ---: | ---: | --- | --- |'
  ];
  for(const row of artifact.rows){
    const next = row.status === 'target-quality-blocked'
      ? 'Promote clean video-derived target windows before tuning runtime sprites against this role.'
      : row.modelSupport.weakModelSupport
        ? 'Keep target-crop scoring primary; improve inferred model row support before using model rows as visual truth.'
        : 'Use as a tuning target, while preserving authority metadata in score reports.';
    lines.push(`| ${row.label} | ${row.status} | ${row.qualityScore10}/10 | ${row.bestAuthorityScore10 ?? 'n/a'}/10 | ${row.issues.join('<br>') || 'none'} | ${next} |`);
  }
  lines.push('', '## Measurement Rule', '', 'Future sprite tuning should cite both runtime score and target quality. Challenge specialty aliens are intentionally blocked as release-facing conformance targets until clean challenge-stage windows replace planning-only sheet cells.', '');
  return `${lines.join('\n')}\n`;
}

function main(){
  const artifacts = {
    targetCrops: readJson(TARGET_CROPS),
    audit: readJson(TARGET_EVIDENCE_AUDIT),
    model: readJson(MODEL),
    runtime: readJson(RUNTIME),
    runtimeVsTarget: readJson(RUNTIME_VS_TARGET),
    temporal: readJson(TEMPORAL_TARGETS, { rows: [] }),
    cadence: readJson(CADENCE_TARGETS, { rows: [] })
  };
  for(const [name, artifact] of Object.entries(artifacts)){
    if(!artifact) fail(`Missing source artifact for alien target quality audit: ${name}`);
  }
  const rows = ROLE_SPECS.map(spec => roleQuality(spec, artifacts));
  const sorted = rows.slice().sort((a, b) => a.qualityScore10 - b.qualityScore10);
  const artifact = {
    schemaVersion: 1,
    artifactType: 'galaga-alien-target-quality-audit',
    generatedAt: new Date().toISOString(),
    commit: git(['rev-parse', '--short', 'HEAD'], 'unknown'),
    branch: git(['branch', '--show-current'], 'unknown'),
    dirty: !!git(['status', '--porcelain'], ''),
    status: rows.some(row => row.status === 'target-quality-blocked')
      ? 'target-quality-gaps-explicit'
      : 'target-quality-usable',
    sourceArtifacts: {
      targetCrops: TARGET_CROPS,
      targetEvidenceAudit: TARGET_EVIDENCE_AUDIT,
      model: MODEL,
      runtime: RUNTIME,
      runtimeVsTarget: RUNTIME_VS_TARGET,
      temporalTargets: TEMPORAL_TARGETS,
      cadenceTargets: CADENCE_TARGETS
    },
    contactSheet: rel(CONTACT_SHEET),
    report: rel(REPORT),
    summary: {
      roleCount: rows.length,
      usableCount: rows.filter(row => row.status === 'target-quality-usable').length,
      usableWithCaveatsCount: rows.filter(row => row.status === 'target-quality-usable-with-caveats').length,
      blockedCount: rows.filter(row => row.status === 'target-quality-blocked').length,
      lowestQualityRoleKey: sorted[0]?.roleKey || '',
      lowestQualityScore10: sorted[0]?.qualityScore10 ?? null,
      privateOrMissingTargetImageRoleCount: rows.filter(row => row.imageAvailability.availableTargetImageCount < row.imageAvailability.targetImageCount).length,
      challengeSpecialtyBlocked: rows.some(row => row.roleKey === 'challenge-specialty-aliens' && row.status === 'target-quality-blocked')
    },
    rows
  };
  writeJson(OUT, artifact);
  writeText(CONTACT_SHEET, renderContactSheet(rows, artifacts));
  writeText(REPORT, markdown(artifact));
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(OUT),
    contactSheet: rel(CONTACT_SHEET),
    report: rel(REPORT),
    summary: artifact.summary
  }, null, 2));
}

try{
  main();
}catch(err){
  fail(err && err.stack ? err.stack : String(err));
}

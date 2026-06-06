#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { withHarnessPage } = require('./browser-check-util');

const ROOT = path.resolve(__dirname, '..', '..');
const SWEEP = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-candidate-sweep', 'latest.json');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-path-visuals');
const SAMPLE_TIMES = Array.from({ length: 49 }, (_, index) => +(index * 0.33).toFixed(2));
const PLAY_W = 280;
const PLAY_H = 360;

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, value){
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(file, value){
  ensureDir(path.dirname(file));
  const clean = String(value)
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trimEnd();
  fs.writeFileSync(file, `${clean}\n`);
}

function esc(value){
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[ch]);
}

function round(value, digits = 3){
  return Number.isFinite(+value) ? +(+value).toFixed(digits) : null;
}

function gitShortCommit(){
  try{
    return execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function gitBranch(){
  try{
    return execFileSync('git', ['-C', ROOT, 'branch', '--show-current'], { encoding: 'utf8' }).trim();
  }catch{
    return 'unknown';
  }
}

function selectRows(sweep){
  const candidates = Array.isArray(sweep.candidates) ? sweep.candidates : [];
  const diagnostics = sweep.diagnostics || {};
  const byId = id => candidates.find(row => row.candidateId === id) || null;
  const selected = [
    { label: 'Baseline', row: byId(sweep.summary?.baselineCandidateId || 'baseline-current') || byId('baseline-current') },
    { label: 'Best Selection', row: byId(sweep.summary?.bestCandidateId) },
    { label: 'Least Bunched', row: byId(diagnostics.leastBunchedTop?.[0]?.candidateId) },
    { label: 'Best Route', row: byId(diagnostics.routeAwareTop?.[0]?.candidateId) },
    { label: 'Best Deconflict', row: byId(diagnostics.deconflictTop?.[0]?.candidateId) }
  ];
  const seen = new Set();
  return selected.filter(item => item.row?.candidateId).filter(item => {
    if(seen.has(item.row.candidateId)) return false;
    seen.add(item.row.candidateId);
    return true;
  });
}

async function measureRows(stage, selected){
  return withHarnessPage({ stage, ships: 3, challenge: false, seed: 9311 }, async ({ page }) => {
    const measured = [];
    for(const item of selected){
      const result = await page.evaluate(({ stage, item, sampleTimes }) => {
        const h = window.__galagaHarness__;
        h.setupChallengeMotionProfileTest({ stage, layoutOverride: item.row.layout || null });
        const tracks = {};
        const record = t => {
          const formation = h.challengeFormationState();
          for(const e of formation.enemies || []){
            if(Number.isFinite(+e.spawn) && +e.spawn > 0.03) continue;
            if(Number.isFinite(+e.x) && (+e.x < -12 || +e.x > 292)) continue;
            if(Number.isFinite(+e.y) && (+e.y < -24 || +e.y > 384)) continue;
            const id = `${e.wave}:${e.lane}:${e.id}`;
            if(!tracks[id]){
              tracks[id] = {
                id,
                wave: e.wave,
                lane: e.lane,
                type: e.type,
                family: e.family,
                points: []
              };
            }
            tracks[id].points.push({ t, x: e.x, y: e.y });
          }
        };
        let previous = 0;
        for(const t of sampleTimes){
          const dt = Math.max(0, t - previous);
          if(dt) h.advanceFor(dt, { step: 1 / 60, stopOnGameOver: false });
          previous = t;
          record(t);
        }
        return {
          label: item.label,
          candidateId: item.row.candidateId,
          humanVisible: item.row.humanVisibleGuardrails || null,
          expectedScore10: item.row.expectedMatch?.score10 ?? null,
          targetVideoObjectFitScore10: item.row.targetVideoObjectFit?.score10 ?? null,
          humanPerfectPotentialScore10: item.row.humanPerfectPotential?.score10 ?? null,
          tracks: Object.values(tracks)
        };
      }, { stage, item, sampleTimes: SAMPLE_TIMES });
      measured.push(result);
    }
    return measured;
  });
}

function colorForWave(wave){
  return ['#ff6961', '#facc15', '#5eead4', '#93c5fd', '#c084fc'][Math.abs(+wave || 0) % 5];
}

function panel(row, index){
  const panelW = 250;
  const panelH = 342;
  const plotX = 22 + index * (panelW + 18);
  const plotY = 94;
  const fieldX = plotX + 16;
  const fieldY = plotY + 46;
  const fieldW = 214;
  const fieldH = 252;
  const tracks = (row.tracks || []).filter(track => (track.points || []).length >= 2).slice(0, 44);
  const paths = tracks.map(track => {
    const points = track.points.map(point => {
      const x = fieldX + Math.max(0, Math.min(PLAY_W, +point.x || 0)) / PLAY_W * fieldW;
      const y = fieldY + Math.max(0, Math.min(PLAY_H, +point.y || 0)) / PLAY_H * fieldH;
      return `${round(x, 1)},${round(y, 1)}`;
    }).join(' ');
    return `<polyline points="${points}" fill="none" stroke="${colorForWave(track.wave)}" stroke-width="1.4" opacity=".72"/>`;
  }).join('\n');
  const visible = row.humanVisible || {};
  return `
    <g>
      <rect x="${plotX}" y="${plotY}" width="${panelW}" height="${panelH}" rx="12" fill="#0d2232" stroke="#31566e"/>
      <text x="${plotX + 16}" y="${plotY + 26}" fill="#f4fbff" font-size="17" font-weight="700">${esc(row.label)}</text>
      <text x="${plotX + 16}" y="${plotY + 44}" fill="#9ed1ec" font-size="10">${esc(row.candidateId)}</text>
      <rect x="${fieldX}" y="${fieldY}" width="${fieldW}" height="${fieldH}" fill="#03080c" stroke="#24495f"/>
      <line x1="${fieldX}" x2="${fieldX + fieldW}" y1="${fieldY + fieldH * .5}" y2="${fieldY + fieldH * .5}" stroke="#143246" stroke-dasharray="4 6"/>
      ${paths}
      <text x="${plotX + 16}" y="${plotY + 320}" fill="#c9eaff" font-size="11">visible ${visible.score10 ?? 'n/a'}/10, risk ${visible.bunchingRisk ?? 'n/a'}, magic ${visible.magicAppearanceRisk ?? 'n/a'}</text>
    </g>
  `;
}

function buildSvg(report){
  const panelW = 268;
  const width = Math.max(980, 44 + (report.candidates || []).length * panelW);
  const height = 486;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="#06131d"/>
  <text x="24" y="42" fill="#f8fbff" font-size="28" font-weight="800">Stage ${esc(report.stage)} Challenge Path Visuals</text>
  <text x="24" y="72" fill="#a9cee3" font-size="14">Sampled Aurora runtime paths. Color groups follow wave index; this is for human route readability, not a pixel-perfect target overlay.</text>
  ${(report.candidates || []).map(panel).join('\n')}
  <text x="24" y="462" fill="#88aac0" font-size="12">Generated ${esc(report.generatedAt)} on ${esc(report.branch)} @ ${esc(report.commit)}.</text>
</svg>`;
}

async function main(){
  if(!fs.existsSync(SWEEP)) throw new Error('Missing latest challenge-stage candidate sweep.');
  const sweep = readJson(SWEEP);
  const selected = selectRows(sweep);
  const stage = +sweep.stage || 7;
  const candidates = await measureRows(stage, selected);
  const report = {
    schemaVersion: 1,
    artifactType: 'challenge-path-visuals',
    generatedAt: new Date().toISOString(),
    commit: gitShortCommit(),
    branch: gitBranch(),
    stage,
    sourceSweep: 'reference-artifacts/analyses/challenge-stage-candidate-sweep/latest.json',
    sampleTimes: SAMPLE_TIMES,
    candidates,
    summary: {
      candidateCount: candidates.length,
      playerMeaning: 'Path visuals make the alien route grammar inspectable: reviewers can see whether candidates arrive as coherent waves or collapse into unreadable clusters.'
    }
  };
  writeJson(path.join(OUT_ROOT, 'latest.json'), report);
  writeText(path.join(OUT_ROOT, 'latest.svg'), buildSvg(report));
  console.log(JSON.stringify({
    ok: true,
    stage,
    candidateCount: candidates.length,
    artifact: 'reference-artifacts/analyses/challenge-path-visuals/latest.json',
    svg: 'reference-artifacts/analyses/challenge-path-visuals/latest.svg'
  }, null, 2));
}

main().catch(err => {
  console.error(err.stack || err.message || err);
  process.exit(1);
});

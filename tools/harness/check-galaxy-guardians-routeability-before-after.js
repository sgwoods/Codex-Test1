#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'routeability-before-after-0.1.json');
const MARKDOWN = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'routeability-before-after-0.1.md');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function finite(value){
  return Number.isFinite(+value);
}

function main(){
  if(!fs.existsSync(ARTIFACT)){
    fail('Missing Guardians routeability before/after artifact. Run npm run harness:analyze:galaxy-guardians-routeability-before-after first.', { artifact: rel(ARTIFACT) });
  }
  if(!fs.existsSync(MARKDOWN)){
    fail('Missing Guardians routeability before/after markdown report.', { markdown: rel(MARKDOWN) });
  }
  const artifact = readJson(ARTIFACT);
  if(artifact.gameKey !== 'galaxy-guardians-preview' || artifact.artifactType !== 'galaxy-guardians-routeability-before-after'){
    fail('Guardians routeability before/after artifact is linked incorrectly.', artifact);
  }
  if(artifact.status !== 'analysis-only-no-runtime-change'){
    fail('Guardians routeability before/after must remain analysis-only until runtime promotion is intentional.', artifact);
  }
  if(!artifact.scenario || artifact.scenario.stage !== 5 || !Array.isArray(artifact.scenario.personas) || artifact.scenario.personas.length < 3){
    fail('Guardians routeability before/after scenario is missing the stage-five persona review shape.', artifact.scenario);
  }
  if(!finite(artifact.baseline?.score10) || artifact.baseline.score10 < 3.5){
    fail('Guardians routeability before/after baseline score is missing or implausible.', artifact.baseline);
  }
  const candidates = artifact.candidates || [];
  if(candidates.length < 3){
    fail('Guardians routeability before/after needs at least three candidate variants.', { count: candidates.length });
  }
  for(const candidate of candidates){
    if(!candidate.id || !candidate.patch || !finite(candidate.routeabilityLift10) || !finite(candidate.pressureRetention)){
      fail('Guardians routeability before/after candidate is missing patch or metrics.', candidate);
    }
    if(!candidate.promotionGate || typeof candidate.promotionGate.pass !== 'boolean'){
      fail('Guardians routeability before/after candidate is missing promotion gate result.', candidate);
    }
  }
  if(!artifact.summary?.bestCandidateId || !finite(artifact.summary.bestCandidateRouteabilityLift10)){
    fail('Guardians routeability before/after summary is missing best candidate metrics.', artifact.summary);
  }
  const chart = artifact.media?.summaryChart ? path.join(ROOT, artifact.media.summaryChart) : null;
  if(!chart || !fs.existsSync(chart)){
    fail('Guardians routeability before/after artifact is missing the SVG summary chart.', artifact.media);
  }
  const markdown = fs.readFileSync(MARKDOWN, 'utf8');
  if(!markdown.includes('Routeability Before/After') || !markdown.includes('analysis-only')){
    fail('Guardians routeability before/after markdown report is missing readable status context.', { markdown: rel(MARKDOWN) });
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(ARTIFACT),
    markdown: rel(MARKDOWN),
    baselineScore10: artifact.summary.baselineScore10,
    bestCandidateId: artifact.summary.bestCandidateId,
    bestCandidateScore10: artifact.summary.bestCandidateScore10,
    bestCandidateRouteabilityLift10: artifact.summary.bestCandidateRouteabilityLift10,
    bestCandidatePass: artifact.summary.bestCandidatePass,
    summaryChart: rel(chart)
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

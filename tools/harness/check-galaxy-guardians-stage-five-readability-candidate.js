#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'stage-five-readability-candidate-0.1.json');
const MARKDOWN = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'stage-five-readability-candidate-0.1.md');
const SPEC_DELTA = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'stage-five-lower-field-readability-spec-delta-0.1.json');
const PROFILE_SET = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'stage-five-readability-candidate-profiles-0.1.json');

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

function mustExist(relPath, payload){
  if(!relPath || !fs.existsSync(path.join(ROOT, relPath))){
    fail(`Stage-five readability candidate cites missing evidence: ${relPath || '(empty)'}`, payload);
  }
}

function main(){
  if(!fs.existsSync(ARTIFACT)){
    fail('Missing Guardians stage-five readability candidate artifact. Run npm run harness:analyze:galaxy-guardians-stage-five-readability-candidate first.', { artifact: rel(ARTIFACT) });
  }
  if(!fs.existsSync(MARKDOWN)){
    fail('Missing Guardians stage-five readability candidate markdown companion.', { markdown: rel(MARKDOWN) });
  }
  const artifact = readJson(ARTIFACT);
  const specDelta = readJson(SPEC_DELTA);
  const profileSet = readJson(PROFILE_SET);
  const payload = {
    artifact: rel(ARTIFACT),
    status: artifact.status,
    summary: artifact.summary
  };
  if(artifact.gameKey !== 'galaxy-guardians-preview'){
    fail('Stage-five readability candidate is linked to the wrong game.', payload);
  }
  if(artifact.artifactType !== 'galaxy-guardians-stage-five-readability-candidate'){
    fail('Stage-five readability candidate has the wrong artifact type.', payload);
  }
  if(artifact.status !== 'analysis-only-no-runtime-change' || artifact.summary?.runtimeChangeAllowed !== false){
    fail('Stage-five readability candidate must remain analysis-only with runtime changes disabled.', payload);
  }
  if(artifact.specDeltaCandidateId !== specDelta.candidateId){
    fail('Stage-five readability candidate is not linked to the active spec delta candidate id.', {
      expected: specDelta.candidateId,
      actual: artifact.specDeltaCandidateId
    });
  }
  for(const source of Object.values(artifact.sourceEvidence || {})){
    mustExist(source, payload);
  }
  if(artifact.sourceEvidence?.candidateProfiles !== rel(PROFILE_SET)){
    fail('Stage-five readability candidate must cite the loadable candidate-profile set.', artifact.sourceEvidence);
  }
  if(artifact.candidateProfileSet?.candidateCount !== profileSet.candidates?.length){
    fail('Stage-five readability candidate profile metadata drifted from the profile artifact.', {
      report: artifact.candidateProfileSet,
      profileCandidateCount: profileSet.candidates?.length
    });
  }
  if(artifact.scenario?.stage !== 5 || artifact.scenario?.stageRank !== 3){
    fail('Stage-five readability candidate must target stage five / rank three.', artifact.scenario);
  }
  if(!Array.isArray(artifact.scenario?.personas) || artifact.scenario.personas.length < 3){
    fail('Stage-five readability candidate needs the three-persona routeability shape.', artifact.scenario);
  }
  if(!finite(artifact.baseline?.lowerFieldReadabilityScore10) || artifact.baseline.lowerFieldReadabilityScore10 < 3.0){
    fail('Stage-five readability candidate baseline readability is missing or implausible for the stricter lane-overlap scale.', artifact.baseline);
  }
  const candidates = artifact.candidates || [];
  if(candidates.length < 5){
    fail('Stage-five readability candidate needs the original candidates plus an expanded profile family.', { count: candidates.length });
  }
  if(!candidates.some(candidate => candidate.family === 'path-topology-lane-separation')){
    fail('Stage-five readability candidate report must include the path-topology/lane-separation family.', { families: candidates.map(candidate => candidate.family) });
  }
  for(const candidate of candidates){
    if(!candidate.id || !candidate.patch || !finite(candidate.lowerFieldReadabilityScore10) || !finite(candidate.readabilityLift10)){
      fail('Stage-five readability candidate is missing patch or readability metrics.', candidate);
    }
    if(candidate.patch.minRank !== 3 || candidate.patch.maxRank !== 3){
      fail('Stage-five readability candidate patches must be harness-scoped to rank three.', candidate.patch);
    }
    if(candidate.missilePacePreserved !== true){
      fail('Stage-five readability candidate must preserve missile pace and single-shot cadence.', candidate);
    }
    if(!candidate.promotionGate || candidate.promotionGate.runtimeChangeAllowed !== false){
      fail('Stage-five readability candidate is missing the no-runtime-change gate.', candidate);
    }
  }
  if(!artifact.summary?.bestCandidateId || !finite(artifact.summary.bestCandidateReadabilityLift10)){
    fail('Stage-five readability candidate summary is missing best-candidate metrics.', artifact.summary);
  }
  if(!artifact.summary?.bestTopologyCandidateId || !finite(artifact.summary.bestTopologyCandidateReadabilityLift10)){
    fail('Stage-five readability candidate summary must report the expanded topology-family result.', artifact.summary);
  }
  if(artifact.summary.bestCandidatePass !== true || artifact.summary.bestCandidateReadabilityLift10 < 0.2){
    fail('Stage-five readability candidate must identify at least one missile-neutral profile that clears the measurement gate.', artifact.summary);
  }
  const chart = artifact.media?.summaryChart ? path.join(ROOT, artifact.media.summaryChart) : null;
  if(!chart || !fs.existsSync(chart)){
    fail('Stage-five readability candidate is missing the SVG summary chart.', artifact.media);
  }
  const markdown = fs.readFileSync(MARKDOWN, 'utf8');
  for(const phrase of ['Stage-Five Readability Candidate', 'no-runtime-change', 'Best Candidate']){
    if(!markdown.includes(phrase)){
      fail('Stage-five readability candidate markdown is missing required status context.', { phrase });
    }
  }
  console.log(JSON.stringify({
    ok: true,
    artifact: rel(ARTIFACT),
    markdown: rel(MARKDOWN),
    summaryChart: rel(chart),
    baselineReadabilityScore10: artifact.summary.baselineReadabilityScore10,
    bestCandidateId: artifact.summary.bestCandidateId,
    bestCandidateReadabilityScore10: artifact.summary.bestCandidateReadabilityScore10,
    bestCandidateReadabilityLift10: artifact.summary.bestCandidateReadabilityLift10,
    bestCandidatePass: artifact.summary.bestCandidatePass,
    runtimeChangeAllowed: artifact.summary.runtimeChangeAllowed
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

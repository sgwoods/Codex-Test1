const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const REVIEW_LEARNING_LATEST = path.join(ROOT, 'reference-artifacts', 'analyses', 'review-learning', 'latest.json');
const CHALLENGE_STAGE_CONFORMANCE_LATEST = path.join(ROOT, 'reference-artifacts', 'analyses', 'challenge-stage-conformance', 'latest.json');
const GALAGA_TARGET_ARTIFACT_COVERAGE_LATEST = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-target-artifact-coverage', 'latest.json');
const CONFORMANCE_INVESTMENT_RETROSPECTIVE_LATEST = path.join(ROOT, 'reference-artifacts', 'analyses', 'conformance-investment-retrospective', 'latest.json');

function esc(value = ''){
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function readJson(file, fallback = null){
  try{
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch{
    return fallback;
  }
}

function scoreNumber(row){
  if(Number.isFinite(+row?.score10)) return Math.max(0, Math.min(10, +row.score10));
  const match = String(row?.current || row?.Current || '').match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
  return match ? Math.max(0, Math.min(10, +match[1])) : null;
}

function scoreLabel(row){
  const score = scoreNumber(row);
  return row?.current || row?.Current || (score === null ? 'n/a' : `${score.toFixed(1)}/10`);
}

function statusClass(score){
  if(score === null) return 'unknown';
  if(score >= 9) return 'strong';
  if(score >= 8) return 'watch';
  return 'gap';
}

function scoreRows(data){
  const rows = Array.isArray(data?.priorityRows) ? data.priorityRows : [];
  if(!rows.length){
    return '<p class="emptyState">Conformance score rows are not available in this build. Regenerate the conformance dashboard before release review.</p>';
  }
  return rows.slice(0, 6).map((row) => {
    const score = scoreNumber(row);
    const width = score === null ? 0 : Math.round(score * 10);
    return `
                <article class="scoreRow ${statusClass(score)}">
                    <div class="scoreHeader">
                        <span class="scoreName">${esc(row.metric || 'Unnamed metric')}</span>
                        <span class="scoreValue">${esc(scoreLabel(row))}</span>
                    </div>
                    <div class="barTrack" aria-hidden="true"><span style="width: ${width}%"></span></div>
                    <p>${esc(row.why || row.status || '')}</p>
                    <div class="scoreMeta">
                        <span>Confidence: ${esc(row.scoreContext?.confidence || row.Confidence || 'unknown')}</span>
                        <span>Target: ${esc(row.target || row.Target || 'not set')}</span>
                    </div>
                </article>`;
  }).join('\n');
}

function releaseGateCards(data){
  const gates = Array.isArray(data?.releaseGate) ? data.releaseGate : [];
  const wanted = ['Overall quality', 'Audio identity', 'Level arc', 'Boss entry and formation grammar'];
  const selected = wanted
    .map(name => gates.find(gate => String(gate.Gate || '').toLowerCase() === name.toLowerCase()))
    .filter(Boolean);
  if(!selected.length) return '';
  return selected.map(gate => `
                <article class="miniMetric">
                    <span>${esc(gate.Gate)}</span>
                    <strong>${esc(gate.Current)}</strong>
                    <small>Target ${esc(gate.Target || 'not set')}</small>
                </article>`).join('\n');
}

function resourceSummary(data){
  const economics = data?.economicsSummary || {};
  const runs = Number.isFinite(+economics.measuredRuns) ? String(economics.measuredRuns) : '--';
  const wall = Number.isFinite(+economics.wallSeconds) ? `${(+economics.wallSeconds / 60).toFixed(1)} min` : '--';
  const cpu = Number.isFinite(+economics.cpuSeconds) ? `${(+economics.cpuSeconds / 60).toFixed(1)} min` : '--';
  const artifacts = Number.isFinite(+economics.artifactBytes) ? `${(+economics.artifactBytes / 1024 / 1024).toFixed(1)} MB` : '--';
  return `
                <article class="miniMetric">
                    <span>Measured runs</span>
                    <strong>${esc(runs)}</strong>
                    <small>Harness and analysis executions in the current economics rollup.</small>
                </article>
                <article class="miniMetric">
                    <span>Wall time</span>
                    <strong>${esc(wall)}</strong>
                    <small>Elapsed local time captured by conformance jobs.</small>
                </article>
                <article class="miniMetric">
                    <span>CPU time</span>
                    <strong>${esc(cpu)}</strong>
                    <small>Local compute used by the measurable assessment loop.</small>
                </article>
                <article class="miniMetric">
                    <span>Artifacts</span>
                    <strong>${esc(artifacts)}</strong>
                    <small>Persisted evidence: traces, reports, frames, audio and charts.</small>
                </article>`;
}

function investmentRows(data){
  const rows = Array.isArray(data?.priorityRows) ? data.priorityRows : [];
  if(!rows.length){
    return '<p class="emptyState">Investment rows are not available in this build.</p>';
  }
  return rows.slice(0, 5).map(row => {
    const cost = row.costContext || {};
    const score = Number.isFinite(+cost.investmentScore) ? (+cost.investmentScore).toFixed(2) : 'guardrail';
    return `
                <article class="investmentRow">
                    <div>
                        <strong>${esc(row.metric || 'Unnamed metric')}</strong>
                        <p>${esc(row.next || '')}</p>
                    </div>
                    <div class="investmentMeta">
                        <span>${esc(cost.summary || row.effort || 'cost pending')}</span>
                        <span>${esc(cost.trackedSpend || 'tracked spend pending')}</span>
                        <span>Value score: ${esc(score)}</span>
                    </div>
                </article>`;
  }).join('\n');
}

function conformanceRetrospectiveCard(){
  const artifact = readJson(CONFORMANCE_INVESTMENT_RETROSPECTIVE_LATEST, null);
  if(!artifact){
    return `
                <article class="card">
                    <h3>Self-critical read pending</h3>
                    <p>Run npm run harness:analyze:conformance-investment-retrospective to publish the latest work-block critique.</p>
                </article>`;
  }
  const movements = Array.isArray(artifact.metricMovements) ? artifact.metricMovements : [];
  const weakest = movements
    .filter(row => Number.isFinite(+row.currentScore10) && row.id !== 'challenge-safety')
    .sort((a, b) => (+a.currentScore10) - (+b.currentScore10))
    .slice(0, 3)
    .map(row => `${row.label}: ${(+row.currentScore10).toFixed(1)}/10`)
    .join('; ');
  const source = 'reference-artifacts/analyses/conformance-investment-retrospective/latest.json; CONFORMANCE_INVESTMENT_RETROSPECTIVE.md';
  return `
                <article class="card emphasis">
                    <h3>Latest self-critical work-block read</h3>
                    <p>${esc(artifact.executiveRead || 'Retrospective summary unavailable.')}</p>
                    <p class="smallText"><strong>Weakest human-level gaps:</strong> ${esc(weakest || 'not scored yet')}.</p>
                    <p class="smallText"><strong>Source:</strong> ${esc(source)}.</p>
                </article>`;
}

function ingestionCards(data){
  const summary = data?.ingestionSummary || {};
  const rows = Array.isArray(data?.ingestionRows) ? data.ingestionRows : [];
  const targetCoverage = loadGalagaTargetArtifactCoverage();
  const targetSummary = targetCoverage?.summary || {};
  const targetCard = targetCoverage
    ? `
                <article class="card emphasis">
                    <h3>Galaga target artifact coverage</h3>
                    <p><strong>${esc(targetSummary.coverageScore10 ?? 'n/a')}/10 overall</strong>; <strong>${esc(targetSummary.challengeStageReadiness10 ?? 'n/a')}/10 challenge-stage readiness</strong>. ${esc(targetSummary.interpretation || '')}</p>
                    <p class="smallText">Critical open sources: ${esc(targetSummary.criticalOpenCount ?? '--')}; missing late challenge windows: ${esc(targetSummary.lateChallengeGapCount ?? '--')}.</p>
                </article>`
    : '';
  const cards = rows.slice(0, 4).map(row => `
                <article class="card">
                    <h3>${esc(row.source || 'Reference source')}</h3>
                    <p>${esc(row.axis || '')}: ${esc(row.coverage || '')}. ${esc(row.annotationStatus || '')}; confidence ${esc(row.confidence || 'unknown')}.</p>
                    <p class="smallText">Next: ${esc(row.next || '')}</p>
                </article>`).join('\n');
  return `
                <article class="card emphasis">
                    <h3>Ingestion coverage</h3>
                    <p>${esc(summary.framing || 'Ingestion data is not available for this build.')}</p>
                    <p class="smallText">Sources: ${esc(summary.sourceFamilyCount ?? '--')} families; high confidence: ${esc(summary.highConfidenceCount ?? '--')}; scored or promoted: ${esc(summary.scoredOrPromotedCount ?? '--')}.</p>
                </article>
${targetCard}
${cards}`;
}

function gameCatalogCards(data){
  const games = Array.isArray(data?.games) ? data.games : [];
  if(!games.length){
    return `
                <article class="card">
                    <h3>Game profiles pending</h3>
                    <p>Game-selectable conformance profiles are not available in this build. Refresh the release conformance dashboard before release review.</p>
                </article>`;
  }
  return games.slice(0, 3).map((game) => {
    const gates = Array.isArray(game.releaseGate) ? game.releaseGate.slice(0, 4) : [];
    const priorities = Array.isArray(game.priorityRows) ? game.priorityRows.slice(0, 3) : [];
    const ingestion = Array.isArray(game.ingestionRows) ? game.ingestionRows.slice(0, 2) : [];
    const gateList = gates.length
      ? `<p class="smallText"><strong>Key gates:</strong> ${gates.map(gate => `${gate.Gate}: ${gate.Current}`).map(esc).join('; ')}.</p>`
      : '';
    const priorityList = priorities.length
      ? `<p class="smallText"><strong>Next work:</strong> ${priorities.map(row => `${row.metric} (${row.current || row.Current || 'n/a'})`).map(esc).join('; ')}.</p>`
      : '';
    const artifactList = ingestion.length
      ? `<p class="smallText"><strong>Live artifacts:</strong> ${ingestion.map(row => row.anchor || row.source || '').filter(Boolean).map(esc).join('; ')}.</p>`
      : '';
    return `
                <article class="card">
                    <h3>${esc(game.gameName || 'Game profile')}</h3>
                    <p><strong>${esc(game.gameStatus || 'Status pending')}.</strong> ${esc(game.releaseRead || game.currentInvestment || '')}</p>
                    ${gateList}
                    ${priorityList}
                    ${artifactList}
                </article>`;
  }).join('\n');
}

function provenanceRows(provenance = {}){
  const surfaces = Array.isArray(provenance?.surfaces) ? provenance.surfaces : [];
  if(!surfaces.length){
    return '<p class="emptyState">Documentation provenance is not available in this build. Restore documentation-provenance.json before release review.</p>';
  }
  return surfaces.map((surface) => {
    const sections = Array.isArray(surface.sections) ? surface.sections : [];
    const sourceList = Array.from(new Set(sections.flatMap(section => Array.isArray(section.sourceArtifacts) ? section.sourceArtifacts : [])));
    const labels = sections.map(section => section.label || section.id).filter(Boolean).slice(0, 4);
    return `
                <article class="investmentRow">
                    <div>
                        <strong>${esc(surface.title || surface.id || 'Documentation surface')}</strong>
                        <p>${esc(surface.summary || '')}</p>
                        <p class="smallText"><strong>Generated as:</strong> ${esc(surface.visiblePath || 'lane documentation')}.</p>
                    </div>
                    <div class="investmentMeta">
                        <span>Builder: ${esc(surface.builder || 'build pipeline')}</span>
                        <span>Sections: ${esc(labels.join('; ') || 'declared in manifest')}</span>
                        <span>Persistent Inputs: ${esc(sourceList.slice(0, 4).join('; ') || 'pending')}</span>
                    </div>
                </article>`;
  }).join('\n');
}

function loadReviewLearning(){
  return readJson(REVIEW_LEARNING_LATEST, null);
}

function loadChallengeStageConformance(){
  const artifact = readJson(CHALLENGE_STAGE_CONFORMANCE_LATEST, null);
  if(!artifact) return null;
  return Object.assign({}, artifact, {
    stageRows: Array.isArray(artifact.stageRows) ? artifact.stageRows : []
  });
}

function loadGalagaTargetArtifactCoverage(){
  const artifact = readJson(GALAGA_TARGET_ARTIFACT_COVERAGE_LATEST, null);
  if(!artifact) return null;
  return Object.assign({}, artifact, {
    rows: Array.isArray(artifact.rows) ? artifact.rows : [],
    challengeStageCoverage: Array.isArray(artifact.challengeStageCoverage) ? artifact.challengeStageCoverage : [],
    summary: artifact.summary || {}
  });
}

function challengeStageDisplayLabel(row = {}){
  const marker = Number.isFinite(+row.stage) ? +row.stage : '';
  if(!marker) return 'Challenging Stage interval pending';
  return `Challenging Stage ${Math.max(1, marker - 1)}-${marker}`;
}

function challengeStagePublicCards(artifact){
  if(!artifact){
    return `
                <article class="card">
                    <h3>Challenge-stage analysis pending</h3>
                    <p>Run npm run harness:analyze:challenge-stage-conformance to publish the critical stage-by-stage readout.</p>
                </article>`;
  }
  const summary = artifact.summary || {};
  const rows = (artifact.stageRows || []).slice(0, 5).map(row => `
                <details class="investmentRow challengeDisclosure">
                    <summary>
                    <div>
                        <strong>${esc(challengeStageDisplayLabel(row))}: ${esc(row.interestingFactor10)}/10 interest</strong>
                        <p>${esc(row.currentRead || '')}</p>
                        <p class="smallText"><strong>Target:</strong> ${esc(row.galagaTarget || '')}</p>
                    </div>
                    <div class="investmentMeta">
                        <span>Internal marker: ${esc(row.stage || 'pending')}</span>
                        <span>Path: ${esc(row.pathFamily || 'pending')}</span>
                        <span>Best ref: ${esc(row.bestReferenceMatch?.labelId || 'pending')} (${esc(row.referenceMatchScore10 ?? 'n/a')}/10)</span>
                    </div>
                    </summary>
                    <div class="challengeInlineDetail">
                        <div>
                            <strong>Movement</strong>
                            <p>${esc(row.movementRead || 'Movement read pending.')}</p>
                        </div>
                        <div>
                            <strong>Aliens / Graphics</strong>
                            <p>${esc(row.graphicsRead || '')}</p>
                            <p class="smallText">${esc(row.alienVariationRead || '')}</p>
                            <p class="smallText"><strong>Group identity:</strong> ${esc(row.groupIdentityScore10 ?? 'n/a')}/10. ${esc(row.groupIdentityRead || 'Wave/group identity read pending.')}</p>
                        </div>
                        <div>
                            <strong>Gap / Next</strong>
                            <p>${esc((row.criticalGaps || [])[0] || 'No critical gap recorded yet; improve scorer resolution.')}</p>
                            <p class="smallText">${esc((row.nextActions || [])[0] || 'Next action pending.')}</p>
                        </div>
                    </div>
                </details>`).join('\n');
  return `
                <article class="card emphasis">
                    <h3>Challenge-stage critical read</h3>
                    <p><strong>${esc(summary.interestingFactorScore10 ?? 'n/a')}/10 interesting factor</strong> and <strong>${esc(summary.score10 ?? 'n/a')}/10 conformance</strong>. ${esc(summary.weakestFinding || '')}</p>
                    <p class="smallText">${esc(summary.playerMeaning || '')}</p>
                </article>
${rows}`;
}

function reviewLearningSummaryCards(ledger){
  if(!ledger){
    return `
                <article class="miniMetric">
                    <span>Review ledger</span>
                    <strong>Missing</strong>
                    <small>Run npm run review:cycle before release review.</small>
                </article>`;
  }
  const summary = ledger.summary || {};
  const disposition = summary.productionDisposition || {};
  return `
                <article class="miniMetric">
                    <span>Review cycles</span>
                    <strong>${esc(summary.reviewCycleCount ?? '--')}</strong>
                    <small>Architecture and code-review cycles represented in the learning ledger.</small>
                </article>
                <article class="miniMetric">
                    <span>Issue notes</span>
                    <strong>${esc(summary.issueNoteCount ?? '--')}</strong>
                    <small>Tracked findings, observations, and in-progress review concerns.</small>
                </article>
                <article class="miniMetric">
                    <span>Accepted changes</span>
                    <strong>${esc(summary.acceptedChangeCount ?? '--')}</strong>
                    <small>Review-driven process or implementation changes accepted into the project.</small>
                </article>
                <article class="miniMetric">
                    <span>Blocking findings</span>
                    <strong>P0 ${esc(summary.p0 ?? 0)} / P1 ${esc(summary.p1 ?? 0)}</strong>
                    <small>P0/P1 findings block hosted-dev movement. Production dispositions: ${esc(disposition.addressed ?? '--')} addressed, ${esc(disposition.dismissed ?? '--')} dismissed, ${esc(disposition.missing ?? '--')} missing.</small>
                </article>`;
}

function reviewLearningIssueRows(ledger){
  const rows = Array.isArray(ledger?.issueNotes) ? ledger.issueNotes : [];
  if(!rows.length){
    return '<p class="emptyState">Review issue notes are not available in this build.</p>';
  }
  return rows.slice(0, 6).map(item => `
                <article class="investmentRow">
                    <div>
                        <strong>${esc(item.severity || 'P?')} - ${esc(item.category || 'uncategorized')} - ${esc(item.id || 'review-note')}</strong>
                        <p>${esc(item.note || '')}</p>
                        <p class="smallText"><strong>Proposed:</strong> ${esc(item.proposedChange || 'No proposed change recorded.')}</p>
                        <p class="smallText"><strong>Production disposition:</strong> ${esc(item.productionDisposition?.decision || 'missing')} - ${esc(item.productionDisposition?.reason || 'Requires explicit addressed/dismissed decision before production.')}</p>
                    </div>
                    <div class="investmentMeta">
                        <span>Status: ${esc(item.status || 'unknown')}</span>
                        <span>Source: ${esc(item.source || 'review ledger')}</span>
                        <span>Review decision: ${esc(item.acceptedChange || 'pending')}</span>
                    </div>
                </article>`).join('\n');
}

function reviewLearningPatternCards(ledger){
  const rows = Array.isArray(ledger?.learningPatterns) ? ledger.learningPatterns : [];
  if(!rows.length){
    return `
                <article class="card">
                    <h3>Patterns pending</h3>
                    <p>Run the review cycle to refresh recurring review-learning patterns.</p>
                </article>`;
  }
  return rows.slice(0, 4).map(item => `
                <article class="card">
                    <h3>${esc(item.id || 'Learning pattern')}</h3>
                    <p>${esc(item.pattern || '')}</p>
                    <p class="smallText"><strong>Response:</strong> ${esc(item.response || '')}</p>
                </article>`).join('\n');
}

function buildPublicProjectSections(data = {}, provenance = {}){
  const reviewLearning = loadReviewLearning();
  const challengeStageConformance = loadChallengeStageConformance();
  return {
    PUBLIC_RELEASE_GATE_CARDS: releaseGateCards(data),
    PUBLIC_CONFORMANCE_SCORE_CHART: scoreRows(data),
    PUBLIC_RESOURCE_SUMMARY_CARDS: resourceSummary(data),
    PUBLIC_INVESTMENT_QUEUE: investmentRows(data),
    PUBLIC_CONFORMANCE_RETROSPECTIVE: conformanceRetrospectiveCard(),
    PUBLIC_INGESTION_OVERVIEW_CARDS: ingestionCards(data),
    PUBLIC_GAME_CATALOG_CARDS: gameCatalogCards(data),
    PUBLIC_CHALLENGE_STAGE_ANALYSIS: challengeStagePublicCards(challengeStageConformance),
    PUBLIC_REVIEW_LEARNING_SUMMARY: reviewLearningSummaryCards(reviewLearning),
    PUBLIC_REVIEW_LEARNING_ISSUES: reviewLearningIssueRows(reviewLearning),
    PUBLIC_REVIEW_LEARNING_PATTERNS: reviewLearningPatternCards(reviewLearning),
    PUBLIC_DOCUMENTATION_PROVENANCE: provenanceRows(provenance)
  };
}

module.exports = {
  buildPublicProjectSections
};

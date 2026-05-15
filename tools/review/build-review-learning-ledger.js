#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'review-learning');
const LATEST_CODE_REVIEW = path.join(ROOT, 'reference-artifacts', 'analyses', 'code-review', 'latest.json');
const LEDGER_MD = path.join(ROOT, 'REVIEW_LEARNING_LEDGER.md');
const REVIEW_DISPOSITIONS = path.join(ROOT, 'review-dispositions.json');

function git(args, fallback = ''){
  try{
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function readJson(file, fallback){
  try{
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch{
    return fallback;
  }
}

function dispositionMap(){
  const data = readJson(REVIEW_DISPOSITIONS, { decisions: [] });
  const map = new Map();
  for(const item of Array.isArray(data.decisions) ? data.decisions : []){
    if(!item || !item.id) continue;
    map.set(String(item.id), {
      decision: String(item.productionDisposition || '').trim(),
      reason: String(item.reason || '').trim(),
      evidence: Array.isArray(item.evidence) ? item.evidence.map(entry => String(entry || '').trim()).filter(Boolean) : []
    });
  }
  return map;
}

function slugFor(now, commit){
  return `${now.toISOString().slice(0, 10)}-${String(commit || 'unknown').slice(0, 8)}`;
}

function taxonomy(){
  return [
    {
      id: 'architecture-boundary',
      label: 'Architecture boundary',
      meaning: 'Platform responsibilities, game-pack ownership, and shared service seams.'
    },
    {
      id: 'release-tooling',
      label: 'Release tooling',
      meaning: 'Publish commands, lane authority, build stamps, and generated release artifacts.'
    },
    {
      id: 'auth-privacy-score',
      label: 'Auth, privacy, score trust',
      meaning: 'Login, Supabase, protected score submission, replay identity, and user data handling.'
    },
    {
      id: 'browser-media-safety',
      label: 'Browser and media safety',
      meaning: 'HTML injection, windows, embeds, audio/video lifecycle, autoplay, and cross-origin behavior.'
    },
    {
      id: 'performance-loop',
      label: 'Performance loop',
      meaning: 'Animation cadence, timers, event listeners, CPU/GPU use, and long-running harness cost.'
    },
    {
      id: 'harness-fragility',
      label: 'Harness fragility',
      meaning: 'Tests that are too replay-specific, too timing-tight, or not grounded in durable contracts.'
    },
    {
      id: 'docs-artifact-traceability',
      label: 'Docs and artifact traceability',
      meaning: 'Whether human docs, generated artifacts, dashboards, and release notes tell one story.'
    },
    {
      id: 'conformance-evidence',
      label: 'Conformance evidence',
      meaning: 'Reference-backed measurement before gameplay, audio, motion, or visual tuning.'
    }
  ];
}

function severityFromFinding(finding){
  return finding?.severity || 'P3';
}

function categoryForFinding(finding){
  const id = String(finding?.id || '');
  const file = String(finding?.file || '');
  if(id.includes('release') || file === 'package.json' || file.startsWith('tools/build/')) return 'release-tooling';
  if(id.includes('platform') || id.includes('boundary') || file.includes('game-pack') || file.includes('adapter')) return 'architecture-boundary';
  if(id.includes('secret') || id.includes('auth') || id.includes('storage') || /supabase|leaderboard|score|trophy/i.test(file)) return 'auth-privacy-score';
  if(id.includes('html') || id.includes('window') || id.includes('fetch') || /youtube|video|audio|music/i.test(file)) return 'browser-media-safety';
  return 'docs-artifact-traceability';
}

function standingArchitectureNotes(){
  return [
    {
      id: 'architect-key-abstractions',
      category: 'architecture-boundary',
      severity: 'P2',
      status: 'accepted',
      source: 'ARCHITECT_REVIEW_RESPONSE.md',
      note: 'Keep core runtime, shell, service adapter, game-pack, entity, scoring, stage, render, and auth concerns named and separated.',
      proposedChange: 'Continue moving shared behavior into Platinum-owned contracts and game-specific behavior into pack-owned data or adapters.',
      acceptedChange: 'Architecture docs and boundary harnesses are the standing source of truth.'
    },
    {
      id: 'architect-magic-constants',
      category: 'architecture-boundary',
      severity: 'P2',
      status: 'in_progress',
      source: 'ARCHITECT_REVIEW_RESPONSE.md',
      note: 'Some movement, render spacing, animation timing, and gameplay update values still need clearer structural ownership.',
      proposedChange: 'Move stable game-design values into pack/spec structures; keep local math values near implementation with intent comments.',
      acceptedChange: 'Track this as continuing 1.4.0 platform maturity work.'
    },
    {
      id: 'architect-harness-fragility',
      category: 'harness-fragility',
      severity: 'P2',
      status: 'in_progress',
      source: 'ARCHITECT_REVIEW_RESPONSE.md',
      note: 'Recorded-path harnesses can become brittle after motion and pacing changes.',
      proposedChange: 'Prefer state-based assertions, coarse behavioral envelopes, and repeated-run averages where exact replay geometry is not the contract.',
      acceptedChange: 'Measured conformance work should leave more reusable harness logic behind than one-off replay checks.'
    },
    {
      id: 'architect-enemy-spec',
      category: 'conformance-evidence',
      severity: 'P2',
      status: 'in_progress',
      source: 'ARCHITECT_REVIEW_RESPONSE.md',
      note: 'Enemy family definitions should become declarative enough to support new game ingestion and controlled experimentation.',
      proposedChange: 'Continue extracting enemy family, attack pattern, and stage grammar data into game-owned specs.',
      acceptedChange: 'Use ingestion-backed specs before considering heavier persistence infrastructure.'
    }
  ];
}

function standingAcceptedChanges(){
  return [
    {
      id: 'local-code-review-gate',
      category: 'release-tooling',
      status: 'accepted',
      source: 'CODE_REVIEW_MODEL.md',
      proposedChange: 'Introduce a local code review packet and hosted-dev gate before publish.',
      acceptedChange: 'Implemented `npm run review:code:packet`, `npm run review:code:check`, and a hosted-dev publish gate that blocks stale packets and P0/P1 findings.',
      learning: 'A lightweight deterministic gate catches obvious release, security, and boundary risk without turning every dev publish into a full architecture board.'
    },
    {
      id: 'code-review-packet-freshness',
      category: 'release-tooling',
      status: 'accepted',
      source: 'tools/review/check-code-review-gate.js',
      proposedChange: 'Make the gate compare the review packet against the current changed source set.',
      acceptedChange: 'Implemented freshness checking so a stale packet fails before hosted-dev publish.',
      learning: 'Review artifacts must stay tied to the exact changed set they describe.'
    },
    {
      id: 'review-learning-ledger',
      category: 'docs-artifact-traceability',
      status: 'accepted',
      source: 'REVIEW_LEARNING_LEDGER.md',
      proposedChange: 'Track architecture and code review issues, notes, proposed changes, accepted changes, and learning patterns in a separate durable location.',
      acceptedChange: 'Created this ledger and a generated JSON artifact under `reference-artifacts/analyses/review-learning/`.',
      learning: 'Review value compounds when repeated issue types become visible and can be turned into future harnesses, checks, and design rules.'
    }
  ];
}

function packetCycle(packet){
  if(!packet) return null;
  return {
    id: `code-review-packet-${String(packet.headCommit || 'unknown').slice(0, 8)}`,
    date: packet.generatedAt ? packet.generatedAt.slice(0, 10) : 'unknown',
    focus: 'Current branch code review packet',
    source: rel(LATEST_CODE_REVIEW),
    changedFileCount: packet.summary?.changedFileCount || 0,
    p0: packet.summary?.p0 || 0,
    p1: packet.summary?.p1 || 0,
    p2: packet.summary?.p2 || 0,
    p3: packet.summary?.p3 || 0,
    outcome: 'Use automatic findings as review notes and blocking P0/P1 gates; P2/P3 remain explicit human-review items.'
  };
}

function issueNotesFromPacket(packet){
  if(!packet || !Array.isArray(packet.automaticFindings)) return [];
  return packet.automaticFindings.map((finding, index) => {
    const id = finding.id || `finding-${index + 1}`;
    return {
      id: `code-review-${id}`,
      category: categoryForFinding(finding),
      severity: severityFromFinding(finding),
      status: severityFromFinding(finding) === 'P0' || severityFromFinding(finding) === 'P1' ? 'blocked' : 'review_note',
      source: rel(LATEST_CODE_REVIEW),
      note: `${finding.file || 'unknown'}: ${finding.message || 'Automatic code review finding.'}`,
      proposedChange: 'Verify the flagged surface with the targeted review questions and recommended checks before lane movement.',
      acceptedChange: severityFromFinding(finding) === 'P0' || severityFromFinding(finding) === 'P1'
        ? 'Not accepted for publish until fixed or downgraded by explicit review evidence.'
        : 'Accepted as a visible review note that does not block hosted-dev by itself.',
      evidence: finding.evidence || ''
    };
  });
}

function learningPatterns(packet){
  const recommended = Array.isArray(packet?.recommendedChecks) ? packet.recommendedChecks : [];
  return [
    {
      id: 'release-tooling-churn',
      pattern: 'Changes to scripts or release tooling often look small but affect lane authority and publish behavior.',
      response: 'Require `npm run publish:check:dev` plus the review packet before hosted-dev movement.',
      evidence: recommended.includes('npm run publish:check:dev') ? 'Latest packet recommends publish preflight.' : 'Standing release gate rule.'
    },
    {
      id: 'generated-artifact-self-noise',
      pattern: 'Generated review artifacts can make review packets appear stale if they are treated as source inputs.',
      response: 'Exclude generated review artifact directories from packet freshness while keeping human-facing review docs in scope.',
      evidence: 'Code review and review-learning artifact directories are excluded from freshness checks.'
    },
    {
      id: 'harness-before-subjective-tuning',
      pattern: 'Motion, audio, pacing, and transition polish can drift when tuned subjectively.',
      response: 'Start with reference evidence, extracted clips, timing windows, or semantic logs, then promote only measured keepers.',
      evidence: 'Matches the repo AGENTS.md instruction for game polish and fidelity work.'
    },
    {
      id: 'review-notes-should-teach',
      pattern: 'One-off review comments lose value unless they become future prevention mechanisms.',
      response: 'Classify recurring findings and decide whether each should become a harness, release check, documentation rule, or code simplification.',
      evidence: 'This ledger tracks issue notes, proposed changes, accepted changes, and learning patterns.'
    }
  ];
}

function buildLedger(){
  const now = new Date();
  const branch = git(['branch', '--show-current'], 'unknown');
  const commit = git(['rev-parse', 'HEAD'], 'unknown');
  const shortCommit = git(['rev-parse', '--short', 'HEAD'], 'unknown');
  const packet = readJson(LATEST_CODE_REVIEW, null);
  const packetFindings = issueNotesFromPacket(packet);
  const architectureNotes = standingArchitectureNotes();
  const acceptedChanges = standingAcceptedChanges();
  const dispositions = dispositionMap();
  const cycles = [
    {
      id: 'architect-lueck-baseline',
      date: 'historical',
      focus: 'Platform architecture baseline',
      source: 'ARCHITECT_REVIEW_RESPONSE.md',
      changedFileCount: null,
      p0: 0,
      p1: 0,
      p2: architectureNotes.length,
      p3: 0,
      outcome: 'Baseline concerns are partly covered and partly continuing maturity work.'
    },
    {
      id: 'code-review-gate-setup',
      date: '2026-05-14',
      focus: 'Local-to-hosted-dev code review gate',
      source: 'CODE_REVIEW_MODEL.md',
      changedFileCount: null,
      p0: 0,
      p1: 0,
      p2: 0,
      p3: 0,
      outcome: 'Accepted as a lightweight release-safety gate for development lane movement.'
    },
    packetCycle(packet)
  ].filter(Boolean);
  const issueNotes = [...architectureNotes, ...packetFindings].map(item => Object.assign({}, item, {
    productionDisposition: dispositions.get(item.id) || null
  }));
  const proposedChanges = [
    ...architectureNotes.map(item => ({
      id: `${item.id}-proposal`,
      category: item.category,
      status: item.status,
      source: item.source,
      proposedChange: item.proposedChange,
      decision: item.acceptedChange
    })),
    ...packetFindings.map(item => ({
      id: `${item.id}-proposal`,
      category: item.category,
      status: item.status,
      source: item.source,
      proposedChange: item.proposedChange,
      decision: item.acceptedChange
    }))
  ];
  const ledger = {
    schemaVersion: 1,
    artifactType: 'platinum-review-learning-ledger',
    generatedAt: now.toISOString(),
    branch,
    commit,
    shortCommit,
    sources: [
      'CODE_REVIEW_MODEL.md',
      'ARCHITECT_REVIEW_RESPONSE.md',
      'codex-skills/platinum-code-review/SKILL.md',
      rel(LATEST_CODE_REVIEW)
    ],
    summary: {
      reviewCycleCount: cycles.length,
      issueNoteCount: issueNotes.length,
      acceptedChangeCount: acceptedChanges.length,
      automaticFindingCount: packetFindings.length,
      p0: issueNotes.filter(item => item.severity === 'P0').length,
      p1: issueNotes.filter(item => item.severity === 'P1').length,
      p2: issueNotes.filter(item => item.severity === 'P2').length,
      p3: issueNotes.filter(item => item.severity === 'P3').length,
      productionDisposition: {
        addressed: issueNotes.filter(item => item.productionDisposition?.decision === 'addressed').length,
        dismissed: issueNotes.filter(item => item.productionDisposition?.decision === 'dismissed').length,
        missing: issueNotes.filter(item => !item.productionDisposition?.decision).length
      }
    },
    taxonomy: taxonomy(),
    reviewCycles: cycles,
    issueNotes,
    proposedChanges,
    acceptedChanges,
    learningPatterns: learningPatterns(packet),
    nextReviewQuestions: [
      'Did this change introduce platform behavior that should be owned by a game pack or game-specific adapter instead?',
      'Did a release, auth, score, or external-media surface change without a targeted harness or publish preflight?',
      'Did any review note recur often enough to deserve a new automatic check?',
      'Did generated artifacts and human-facing docs stay synchronized with the source change?',
      'Did conformance polish leave behind reusable ingestion, analysis, or scoring logic?'
    ]
  };
  return ledger;
}

function table(headers, rows){
  const safeRows = rows.length ? rows : [headers.map(() => '')];
  const lines = [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`
  ];
  for(const row of safeRows){
    lines.push(`| ${row.map(cell => String(cell ?? '').replace(/\n/g, '<br>').replace(/\|/g, '\\|')).join(' | ')} |`);
  }
  return lines.join('\n');
}

function md(ledger){
  const cycleRows = ledger.reviewCycles.map(item => [
    item.date,
    item.focus,
    item.source,
    item.changedFileCount === null ? 'standing' : item.changedFileCount,
    `P0 ${item.p0} / P1 ${item.p1} / P2 ${item.p2} / P3 ${item.p3}`,
    item.outcome
  ]);
  const issueRows = ledger.issueNotes.map(item => [
    item.severity,
    item.category,
    item.status,
    item.id,
    item.note,
    item.proposedChange,
    item.productionDisposition
      ? `${item.productionDisposition.decision}: ${item.productionDisposition.reason}`
      : 'missing'
  ]);
  const proposedRows = ledger.proposedChanges.map(item => [
    item.category,
    item.status,
    item.id,
    item.proposedChange,
    item.decision
  ]);
  const acceptedRows = ledger.acceptedChanges.map(item => [
    item.category,
    item.status,
    item.id,
    item.proposedChange,
    item.acceptedChange,
    item.learning
  ]);
  const learningRows = ledger.learningPatterns.map(item => [
    item.id,
    item.pattern,
    item.response,
    item.evidence
  ]);
  const taxonomyRows = ledger.taxonomy.map(item => [
    item.id,
    item.label,
    item.meaning
  ]);
  return `# Review Learning Ledger

This is the durable tracking location for architecture-review and code-review
learning across Aurora Galactica, Platinum, and future game-ingestion work.

The goal is not only to catch issues before a hosted lane move. The goal is to
notice repeated review patterns, decide which proposed fixes are accepted, and
turn that learning into future harnesses, release checks, documentation rules,
or simpler platform/game boundaries.

## Current Snapshot

- generated: \`${ledger.generatedAt}\`
- branch: \`${ledger.branch}\`
- commit: \`${ledger.shortCommit}\`
- review cycles tracked: \`${ledger.summary.reviewCycleCount}\`
- issue notes tracked: \`${ledger.summary.issueNoteCount}\`
- accepted changes tracked: \`${ledger.summary.acceptedChangeCount}\`
- automatic packet findings tracked: \`${ledger.summary.automaticFindingCount}\`

## How To Use This Ledger

1. Run \`npm run review:code\` before hosted-dev movement or any substantial review.
2. Run \`npm run review:ledger\` after architecture/code-review notes are added,
   accepted, rejected, or turned into follow-up checks.
3. Prefer \`npm run review:cycle\` when a review needs both a fresh packet and
   an updated ledger.
4. During beta review, scan the issue-note categories for repeated patterns.
5. Promote repeated patterns into one of: harness, release preflight, platform
   boundary rule, game-pack spec, documentation rule, or explicit non-goal.
6. Before production, every issue must have a production disposition in
   \`review-dispositions.json\`: either \`addressed\` or \`dismissed\`, with a
   rationale and evidence.

## Issue Taxonomy

${table(['Id', 'Label', 'Meaning'], taxonomyRows)}

## Review Cycles

${table(['Date', 'Focus', 'Source', 'Changed Files', 'Findings', 'Outcome'], cycleRows)}

## Issues And Notes

${table(['Severity', 'Category', 'Status', 'Id', 'Note', 'Proposed Action', 'Production Disposition'], issueRows)}

## Change Decisions

## Proposed Changes

${table(['Category', 'Status', 'Id', 'Proposed Change', 'Current Decision'], proposedRows)}

## Accepted Changes

${table(['Category', 'Status', 'Id', 'Proposed Change', 'Accepted Change', 'Learning'], acceptedRows)}

## Learning Patterns

${table(['Id', 'Pattern', 'Response', 'Evidence'], learningRows)}

## Next Review Questions

${ledger.nextReviewQuestions.map(item => `- ${item}`).join('\n')}

## Artifact Trail

The generated machine-readable ledger is written to:

- \`reference-artifacts/analyses/review-learning/latest.json\`
- \`reference-artifacts/analyses/review-learning/<date>-<commit>/report.json\`
- \`reference-artifacts/analyses/review-learning/<date>-<commit>/README.md\`

Generated review-learning artifact directories are excluded from code-review
packet freshness checks. This keeps the review packet focused on source,
human-facing docs, and runtime/tooling changes while preserving this ledger's
own artifact trail.
`;
}

function artifactReadme(ledger){
  return `# Review Learning Artifact

- generated: \`${ledger.generatedAt}\`
- branch: \`${ledger.branch}\`
- commit: \`${ledger.shortCommit}\`
- issue notes: \`${ledger.summary.issueNoteCount}\`
- accepted changes: \`${ledger.summary.acceptedChangeCount}\`

Human-readable source:

- \`REVIEW_LEARNING_LEDGER.md\`
`;
}

function main(){
  const ledger = buildLedger();
  const slug = slugFor(new Date(ledger.generatedAt), ledger.shortCommit);
  const outDir = path.join(OUT_ROOT, slug);
  ensureDir(outDir);
  ensureDir(OUT_ROOT);
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(ledger, null, 2) + '\n');
  fs.writeFileSync(path.join(outDir, 'README.md'), artifactReadme(ledger));
  fs.writeFileSync(path.join(OUT_ROOT, 'latest.json'), JSON.stringify(ledger, null, 2) + '\n');
  fs.writeFileSync(LEDGER_MD, md(ledger));
  console.log(JSON.stringify({
    ok: true,
    ledger: rel(LEDGER_MD),
    latest: rel(path.join(OUT_ROOT, 'latest.json')),
    report: rel(path.join(outDir, 'report.json')),
    issueNoteCount: ledger.summary.issueNoteCount,
    acceptedChangeCount: ledger.summary.acceptedChangeCount
  }, null, 2));
}

main();

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const APP_GUIDE = path.join(ROOT, 'application-guide.json');
const AURORA_PACK = path.join(ROOT, 'src', 'js', '13-aurora-game-pack.js');
const GAME_CATALOG = path.join(ROOT, 'GAME_CONFORMANCE_CATALOG.md');
const CONFORMANCE_ECONOMICS = path.join(ROOT, 'reference-artifacts', 'analyses', 'conformance-economics', 'latest.json');
const DASHBOARD = path.join(ROOT, 'reference-artifacts', 'analyses', 'release-conformance-dashboard', 'latest.json');
const APPLICATION_ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'application-artifact-conformance', 'latest.json');
const PERSONA_DISTRIBUTION = path.join(ROOT, 'reference-artifacts', 'analyses', 'persona-performance-distribution', 'latest.json');
const DOCUMENTATION_PROVENANCE = path.join(ROOT, 'documentation-provenance.json');
const PUBLIC_TEMPLATE = path.join(ROOT, 'src', 'public', 'aurora-galactica.template.html');
const PROJECT_GUIDE_DIST = path.join(ROOT, 'dist', 'dev', 'project-guide.html');
const APPLICATION_GUIDE_DIST = path.join(ROOT, 'dist', 'dev', 'application-guide.html');
const RELEASE_NOTES_DIST = path.join(ROOT, 'dist', 'dev', 'release-notes.html');
const DIST_PUBLIC_PAGE = path.join(ROOT, 'dist', 'dev', 'public-project-page.html');
const LOCAL_PUBLIC_PREVIEW = path.join(ROOT, 'local-dev', 'public-aurora-galactica-preview.html');
const CONFORMANCE_DASHBOARD_DATA_DIST = path.join(ROOT, 'dist', 'dev', 'conformance-dashboard-data.json');

const CHECKED_AUDIO_EVENTS = [
  { entryId: 'formation-arrival', cue: 'formationArrival' },
  { entryId: 'stage-transition', cue: 'stageTransition' },
  { entryId: 'challenge-transition', cue: 'challengeTransition' },
  { entryId: 'challenge-results', cue: 'challengeResults' },
  { entryId: 'challenge-perfect', cue: 'challengePerfect' }
];

function read(file){
  return fs.readFileSync(file, 'utf8');
}

function readJson(file){
  return JSON.parse(read(file));
}

function git(args){
  const out = execFileSync('git', ['-C', ROOT, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  return typeof out === 'string' ? out.trim() : '';
}

function fail(message, extra = {}){
  console.error(JSON.stringify({ ok: false, message, ...extra }, null, 2));
  process.exit(1);
}

function sourceCueBlock(source, cue){
  const escaped = cue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = source.match(new RegExp(`${escaped}:referenceAudioCue\\([^,]+,\\s*\\{([\\s\\S]*?)\\n\\s*\\}\\),?`));
  return match ? match[1] : '';
}

function sourceClipDuration(source, cue){
  const block = sourceCueBlock(source, cue);
  const match = block.match(/clipDuration:\s*(\d*\.?\d+)/);
  if(!match) return null;
  return +match[1];
}

function eventClipDuration(entry){
  const match = String(entry?.audioName || '').match(/excerpt\s+0\.00s-(\d+(?:\.\d+)?)s/i);
  if(!match) return null;
  return +match[1];
}

function nearlyEqual(a, b){
  return Math.abs(a - b) <= 0.005;
}

function releaseGateCurrent(name, dashboard){
  const gate = (dashboard.releaseGate || []).find(row => String(row.Gate || '').toLowerCase() === name.toLowerCase());
  return gate?.Current || '';
}

function publicSyncMarker(html){
  return String(html.match(/public-sync:[^>]+/)?.[0] || '').trim();
}

function relative(file){
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function commitMatchesHead(value, acceptedCommits){
  const commit = String(value || '').trim();
  if(!commit) return false;
  return acceptedCommits.some((candidate) => candidate === commit || candidate.startsWith(commit) || commit.startsWith(candidate));
}

function assertReleaseDocArtifactCurrent(file, label, opts = {}){
  const artifact = readJson(file);
  if(!Number.isFinite(Date.parse(artifact.generatedAt || ''))){
    fail(`${label} is missing a valid generatedAt timestamp.`, {
      file: relative(file),
      expectedAction: 'Run npm run harness:refresh:release-conformance-docs.'
    });
  }
  if(opts.repoClean){
    if(!commitMatchesHead(artifact.commit, opts.headShort, opts.headFull)){
      fail(`${label} does not match the current source head.`, {
        file: relative(file),
        artifactCommit: artifact.commit || null,
        acceptedHeads: opts.acceptedCommits,
        expectedAction: 'Run npm run harness:refresh:release-conformance-docs && npm run build, then commit the refreshed artifacts.'
      });
    }
  }
  return {
    generatedAt: artifact.generatedAt || '',
    commit: artifact.commit || '',
    branch: artifact.branch || '',
    dirty: !!artifact.dirty
  };
}

function assertDocumentationProvenance(provenance){
  if(provenance?.artifactType !== 'documentation-provenance'){
    fail('Documentation provenance artifact has the wrong artifactType.', {
      expected: 'documentation-provenance',
      actual: provenance?.artifactType || null
    });
  }
  const surfaces = Array.isArray(provenance.surfaces) ? provenance.surfaces : [];
  if(surfaces.length < 4){
    fail('Documentation provenance artifact does not describe the main generated documentation surfaces.', {
      surfaceCount: surfaces.length
    });
  }
  const missingSources = [];
  const missingShape = [];
  for(const surface of surfaces){
    if(!surface.id || !surface.visiblePath || !surface.builder){
      missingShape.push({ surface: surface.id || surface.title || 'unknown', reason: 'missing id, visiblePath, or builder' });
    }
    const sections = Array.isArray(surface.sections) ? surface.sections : [];
    if(!sections.length){
      missingShape.push({ surface: surface.id || surface.title || 'unknown', reason: 'missing section provenance rows' });
    }
    for(const section of sections){
      const sources = Array.isArray(section.sourceArtifacts) ? section.sourceArtifacts : [];
      if(!section.id || !section.label || !sources.length){
        missingShape.push({
          surface: surface.id || surface.title || 'unknown',
          section: section.id || section.label || 'unknown',
          reason: 'section must declare id, label, and sourceArtifacts'
        });
      }
      for(const source of sources){
        const full = path.join(ROOT, source);
        if(!fs.existsSync(full)){
          missingSources.push({
            surface: surface.id,
            section: section.id,
            source
          });
        }
      }
    }
  }
  if(missingShape.length){
    fail('Documentation provenance artifact has incomplete surface/section declarations.', { missingShape });
  }
  if(missingSources.length){
    fail('Documentation provenance references missing persistent source artifacts.', { missingSources });
  }
}

const guide = readJson(APP_GUIDE);
const source = read(AURORA_PACK);
const catalog = read(GAME_CATALOG);
const repoHeadShort = git(['rev-parse', '--short', 'HEAD']);
const acceptedArtifactCommits = git(['rev-list', '--max-count', '2', 'HEAD'])
  .split('\n')
  .map((value) => value.trim())
  .filter(Boolean);
const repoClean = !git(['status', '--short']);
const conformanceEconomicsMeta = assertReleaseDocArtifactCurrent(CONFORMANCE_ECONOMICS, 'Conformance economics artifact', {
  repoClean,
  acceptedCommits: acceptedArtifactCommits
});
const dashboard = readJson(DASHBOARD);
const releaseDashboardMeta = assertReleaseDocArtifactCurrent(DASHBOARD, 'Release conformance dashboard artifact', {
  repoClean,
  acceptedCommits: acceptedArtifactCommits
});
const applicationArtifactMeta = assertReleaseDocArtifactCurrent(APPLICATION_ARTIFACT, 'Application artifact conformance status', {
  repoClean,
  acceptedCommits: acceptedArtifactCommits
});
const personaDistribution = readJson(PERSONA_DISTRIBUTION);
const provenance = readJson(DOCUMENTATION_PROVENANCE);

assertDocumentationProvenance(provenance);

if(personaDistribution?.artifactType !== 'persona-performance-distribution'){
  fail('Persona performance distribution artifact has the wrong artifactType.', {
    expected: 'persona-performance-distribution',
    actual: personaDistribution?.artifactType || null
  });
}
const personaRows = Array.isArray(personaDistribution.summaryRows) ? personaDistribution.summaryRows : [];
const underSampledPersonas = personaRows
  .filter(row => ['novice', 'advanced', 'expert', 'professional'].includes(row.persona))
  .filter(row => (+row.runCount || 0) < 30)
  .map(row => ({ persona: row.persona, runCount: row.runCount }));
if(personaRows.length < 4 || underSampledPersonas.length){
  fail('Persona performance distribution is missing the 30-run generic persona evidence required by the current docs.', {
    personaRows: personaRows.length,
    underSampledPersonas
  });
}

const publicTemplate = read(PUBLIC_TEMPLATE);
if(!publicTemplate.includes('{{PUBLIC_DOCUMENTATION_PROVENANCE}}') || !publicTemplate.includes('id="documentation-provenance"')){
  fail('Public project template is missing the generated documentation provenance section/token.', {
    template: relative(PUBLIC_TEMPLATE)
  });
}

const eventsById = new Map((guide.audioEventMatrix || []).map(event => [event.entryId, event]));
const mismatchedEvents = [];
for(const check of CHECKED_AUDIO_EVENTS){
  const event = eventsById.get(check.entryId);
  if(!event){
    mismatchedEvents.push({ entryId: check.entryId, cue: check.cue, reason: 'missing application-guide event' });
    continue;
  }
  const expected = sourceClipDuration(source, check.cue);
  const documented = eventClipDuration(event);
  if(!Number.isFinite(expected) || !Number.isFinite(documented) || !nearlyEqual(expected, documented)){
    mismatchedEvents.push({
      entryId: check.entryId,
      cue: check.cue,
      expected,
      documented,
      audioName: event.audioName
    });
  }
}
if(mismatchedEvents.length){
  fail('Application audio event matrix is stale against runtime cue clip durations.', { mismatchedEvents });
}

const audioCurrent = releaseGateCurrent('Audio identity', dashboard);
const requiredCatalogText = [
  `audio identity category is now ${audioCurrent}`,
  'stageTransition` was too abbreviated, so the reference-backed phrase was widened to 3.35s',
  '`challengeTransition` now uses a 1.6s measured phrase',
  '`challengeResults` uses 1.95s',
  '`challengePerfect` uses 2.15s'
].filter(Boolean);
const missingCatalogText = requiredCatalogText.filter(text => !catalog.includes(text));
if(missingCatalogText.length){
  fail('Game conformance catalog is missing current audio/doc freshness text.', { missingCatalogText });
}

if(fs.existsSync(DIST_PUBLIC_PAGE) && fs.existsSync(LOCAL_PUBLIC_PREVIEW)){
  const distMarker = publicSyncMarker(read(DIST_PUBLIC_PAGE));
  const localMarker = publicSyncMarker(read(LOCAL_PUBLIC_PREVIEW));
  if(distMarker && localMarker && distMarker !== localMarker){
    fail('Local public project preview is stale against dist/dev/public-project-page.html.', {
      distMarker,
      localMarker,
      expectedAction: 'Run npm run build so local-dev/public-aurora-galactica-preview.html is refreshed.'
    });
  }
  const publicHtml = read(DIST_PUBLIC_PAGE);
  const requiredPublicProvenanceText = [
    'Documentation provenance',
    'documentation-provenance.json',
    'Persistent Inputs',
    'reference-artifacts/analyses/release-conformance-dashboard/latest.json'
  ];
  const missingPublicText = requiredPublicProvenanceText.filter(text => !publicHtml.includes(text));
  if(missingPublicText.length){
    fail('Public project page is missing generated documentation provenance content.', {
      missingPublicText,
      expectedAction: 'Run npm run build after restoring documentation-provenance.json and the public template.'
    });
  }
}

if(fs.existsSync(PROJECT_GUIDE_DIST)){
  const projectHtml = read(PROJECT_GUIDE_DIST);
  const requiredProjectText = [
    'Documentation Provenance',
    'Visible Surface',
    'Persistent Inputs',
    'documentation-provenance.json'
  ];
  const missingProjectText = requiredProjectText.filter(text => !projectHtml.includes(text));
  if(missingProjectText.length){
    fail('Project guide is missing generated documentation provenance content.', {
      missingProjectText,
      expectedAction: 'Run npm run build after restoring documentation-provenance.json.'
    });
  }
}

if(fs.existsSync(APPLICATION_GUIDE_DIST)){
  const appHtml = read(APPLICATION_GUIDE_DIST);
  const requiredApplicationText = [
    'Persona Performance Distribution',
    'persona-performance-distribution/latest.json',
    'Seeded full-run games',
    'Challenge Hit Rate'
  ];
  const missingApplicationText = requiredApplicationText.filter(text => !appHtml.includes(text));
  if(missingApplicationText.length){
    fail('Application guide is missing generated persona performance distribution content.', {
      missingApplicationText,
      expectedAction: 'Run npm run build after refreshing reference-artifacts/analyses/persona-performance-distribution/latest.json.'
    });
  }
}

if(fs.existsSync(CONFORMANCE_DASHBOARD_DATA_DIST)){
  const distDashboard = readJson(CONFORMANCE_DASHBOARD_DATA_DIST);
  if((distDashboard.generatedAt || '') !== (dashboard.generatedAt || '') || String(distDashboard.commit || '') !== String(dashboard.commit || '')){
    fail('dist/dev conformance dashboard data is stale against release-conformance-dashboard/latest.json.', {
      distFile: relative(CONFORMANCE_DASHBOARD_DATA_DIST),
      sourceArtifact: relative(DASHBOARD),
      distGeneratedAt: distDashboard.generatedAt || null,
      sourceGeneratedAt: dashboard.generatedAt || null,
      distCommit: distDashboard.commit || null,
      sourceCommit: dashboard.commit || null,
      expectedAction: 'Run npm run build after refreshing the release conformance dashboard artifact.'
    });
  }
}

if(fs.existsSync(RELEASE_NOTES_DIST)){
  const releaseNotesHtml = read(RELEASE_NOTES_DIST);
  const requiredReleaseNotesText = [
    'Aurora / Platinum Release Notes',
    'release-notes.json',
    'RELEASE_NOTE_1.3.0_PRODUCTION_CONFORMANCE_REFRESH.md',
    'Back to release dashboard'
  ];
  const missingReleaseNotesText = requiredReleaseNotesText.filter(text => !releaseNotesHtml.includes(text));
  if(missingReleaseNotesText.length){
    fail('Release notes page is missing generated release-note content.', {
      missingReleaseNotesText,
      expectedAction: 'Run npm run build after restoring the release-notes page generation and source note links.'
    });
  }
}

console.log(JSON.stringify({
  ok: true,
  checkedAudioEvents: CHECKED_AUDIO_EVENTS.length,
  audioCurrent,
  personaRuns: personaDistribution.runCount || 0,
  repoClean,
  conformanceEconomics: conformanceEconomicsMeta,
  releaseDashboard: releaseDashboardMeta,
  applicationArtifactConformance: applicationArtifactMeta,
  provenanceSurfaces: provenance.surfaces.length,
  catalog: path.relative(ROOT, GAME_CATALOG),
  applicationGuide: path.relative(ROOT, APP_GUIDE),
  documentationProvenance: path.relative(ROOT, DOCUMENTATION_PROVENANCE)
}, null, 2));

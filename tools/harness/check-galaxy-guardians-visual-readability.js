#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'visual-readability-0.1.json');
const SOURCES = [
  'src/js/13-galaxy-guardians-game-pack.js',
  'src/js/13-galaxy-guardians-gameplay-adapter.js',
  'src/js/13-galaxy-guardians-runtime.js'
];

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function loadRuntime(){
  const sandbox = { console };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  for(const relPath of SOURCES){
    vm.runInContext(fs.readFileSync(path.join(ROOT, relPath), 'utf8'), sandbox, {
      filename: path.join(ROOT, relPath)
    });
  }
  vm.runInContext(`
    this.GALAXY_GUARDIANS_PACK = GALAXY_GUARDIANS_PACK;
    this.GALAXY_GUARDIANS_RUNTIME_PROFILE = GALAXY_GUARDIANS_RUNTIME_PROFILE;
    this.createGalaxyGuardiansRuntimeState = createGalaxyGuardiansRuntimeState;
    this.stepGalaxyGuardiansRuntime = stepGalaxyGuardiansRuntime;
    this.summarizeGalaxyGuardiansRuntime = summarizeGalaxyGuardiansRuntime;
  `, sandbox);
  return sandbox;
}

function spriteMetrics(visual){
  const rows = Array.from(visual.pixelRows || []);
  const filled = rows.join('').split('').filter(ch => ch !== '.');
  return {
    id: visual.id,
    role: visual.role,
    width: Math.max(...rows.map(row => row.length)),
    height: rows.length,
    filledPixels: filled.length,
    tokenChannels: Array.from(new Set(filled)).sort(),
    paletteChannels: Object.keys(visual.palette || {}).filter(key => visual.palette[key])
  };
}

function rowDifference(a, b){
  const rowsA = Array.from(a.pixelRows || []);
  const rowsB = Array.from(b.pixelRows || []);
  const height = Math.max(rowsA.length, rowsB.length);
  const width = Math.max(...rowsA.map(row => row.length), ...rowsB.map(row => row.length));
  let diff = 0;
  for(let r = 0; r < height; r++){
    const rowA = rowsA[r] || '';
    const rowB = rowsB[r] || '';
    for(let c = 0; c < width; c++){
      if((rowA[c] || '.') !== (rowB[c] || '.')) diff++;
    }
  }
  return diff;
}

function roleSnapshot(runtime, seconds){
  const state = runtime.createGalaxyGuardiansRuntimeState({ stage: 1, ships: 3, seed: 1979 });
  for(let i = 0; i < Math.ceil(seconds * 60); i++) runtime.stepGalaxyGuardiansRuntime(state, 1 / 60, {});
  return runtime.summarizeGalaxyGuardiansRuntime(state);
}

function forceHit(runtime, role){
  const state = runtime.createGalaxyGuardiansRuntimeState({ stage: 1, ships: 3, seed: 1979 });
  for(let i = 0; i < 90; i++) runtime.stepGalaxyGuardiansRuntime(state, 1 / 60, {});
  const alien = state.aliens.find(entry => entry.role === role && entry.hp > 0);
  if(!alien) fail(`No live alien for visual hit role ${role}`);
  state.player.shot = { x: alien.x, y: alien.y + 3, vy: -5, active: 1 };
  runtime.stepGalaxyGuardiansRuntime(state, 1 / 60, {});
  return runtime.summarizeGalaxyGuardiansRuntime(state);
}

function main(){
  const artifact = JSON.parse(fs.readFileSync(ARTIFACT, 'utf8'));
  const runtime = loadRuntime();
  const pack = runtime.GALAXY_GUARDIANS_PACK;
  const visualCatalog = pack.alienVisualCatalog || {};
  const requiredIds = artifact.visualRequirements.requiredVisualIds || [];
  const metrics = Object.fromEntries(requiredIds.map(id => [id, spriteMetrics(visualCatalog[id] || {})]));
  const pairwise = {};
  for(let i = 0; i < requiredIds.length; i++){
    for(let j = i + 1; j < requiredIds.length; j++){
      const a = requiredIds[i], b = requiredIds[j];
      pairwise[`${a}__${b}`] = rowDifference(visualCatalog[a] || {}, visualCatalog[b] || {});
    }
  }
  const entry = roleSnapshot(runtime, .25);
  const formation = roleSnapshot(runtime, 1.45);
  const dive = roleSnapshot(runtime, 2.25);
  const hitSummaries = {
    flagship: forceHit(runtime, 'flagship'),
    escort: forceHit(runtime, 'escort'),
    scout: forceHit(runtime, 'scout')
  };
  const payload = {
    artifactStatus: artifact.status,
    packKey: pack.metadata?.gameKey || '',
    metrics,
    pairwise,
    entry,
    formation,
    dive,
    hitSummaries: Object.fromEntries(Object.entries(hitSummaries).map(([role, summary]) => [role, {
      hitFlashCount: summary.hitFlashCount,
      hitFlashes: summary.hitFlashes,
      audioCueIds: summary.audioCueIds,
      eventTypes: summary.eventTypes
    }]))
  };

  if(payload.packKey !== artifact.gameKey || artifact.status !== 'dev-preview-visual-readability-contract-not-public-release-art'){
    fail('Galaxy Guardians visual readability artifact is not linked to the preview pack', payload);
  }
  for(const id of requiredIds){
    const visual = visualCatalog[id];
    if(!visual) fail(`Missing visual catalog entry ${id}`, payload);
    const metric = metrics[id];
    const minFilled = artifact.visualRequirements.minimumFilledPixels[id] || 1;
    if(metric.filledPixels < minFilled){
      fail(`Visual ${id} has too few filled pixels for gameplay readability`, payload);
    }
    if(metric.paletteChannels.length < artifact.visualRequirements.minimumPaletteChannelsPerSprite){
      fail(`Visual ${id} does not use enough palette channels`, payload);
    }
    for(const forbidden of artifact.visualRequirements.forbiddenAuroraNameFragments || []){
      const haystack = `${id} ${visual.role} ${visual.silhouette} ${visual.notes}`.toLowerCase();
      if(haystack.includes(forbidden)){
        fail(`Visual ${id} leaks Aurora naming fragment ${forbidden}`, payload);
      }
    }
  }
  for(const [pair, diff] of Object.entries(pairwise)){
    if(diff < artifact.visualRequirements.minimumPairwiseRowDifference){
      fail(`Visual pair ${pair} is not distinct enough at row level`, payload);
    }
  }
  if(entry.enteringCount <= 0 || entry.entryComplete){
    fail('Visual readability entry snapshot did not capture entering aliens', payload);
  }
  for(const role of ['flagship', 'escort', 'scout']){
    if(!formation.liveRoles?.[role]){
      fail(`Visual readability formation snapshot is missing role ${role}`, payload);
    }
  }
  if(!dive.activeDives?.length){
    fail('Visual readability dive snapshot did not capture an active dive', payload);
  }
  for(const role of artifact.runtimeRequirements.requiredHitFlashRoles || []){
    const summary = hitSummaries[role];
    if(!summary || summary.hitFlashCount < 1){
      fail(`Visual readability hit resolution did not create a ${role} flash`, payload);
    }
    if(!summary.hitFlashes.some(flash => flash.role === role)){
      fail(`Visual readability hit flash did not preserve role ${role}`, payload);
    }
  }

  console.log(JSON.stringify({
    ok: true,
    artifact: path.relative(ROOT, ARTIFACT),
    metrics,
    pairwise,
    entry: { enteringCount: entry.enteringCount, entryComplete: entry.entryComplete },
    formation: { liveRoles: formation.liveRoles, visualIds: formation.visualIds },
    dive: { activeDives: dive.activeDives.slice(0, 3) },
    hitFlashRoles: Object.fromEntries(Object.entries(hitSummaries).map(([role, summary]) => [role, summary.hitFlashes.map(flash => flash.role)]))
  }, null, 2));
}

try {
  main();
} catch (err) {
  fail(err && err.stack || String(err));
}

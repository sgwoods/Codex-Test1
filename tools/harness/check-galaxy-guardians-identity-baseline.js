#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..', '..');
const ARTIFACT = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxy-guardians-identity', 'identity-baseline-0.1.json');
const PACK_SOURCE = path.join(ROOT, 'src', 'js', '13-galaxy-guardians-game-pack.js');
const ADAPTER_SOURCE = path.join(ROOT, 'src', 'js', '13-galaxy-guardians-gameplay-adapter.js');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function loadGuardiansPack(){
  const source = fs.readFileSync(PACK_SOURCE, 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(`${source}\nthis.GALAXY_GUARDIANS_PACK=GALAXY_GUARDIANS_PACK;`, sandbox, { filename: PACK_SOURCE });
  return sandbox.GALAXY_GUARDIANS_PACK;
}

function main(){
  const artifact = JSON.parse(fs.readFileSync(ARTIFACT, 'utf8'));
  const pack = loadGuardiansPack();
  const adapterSource = fs.readFileSync(ADAPTER_SOURCE, 'utf8');
  const visualCatalog = pack.alienVisualCatalog || {};
  const cueCatalog = pack.audioCueCatalog || {};
  const theme = pack.audioThemes?.['guardians-signal'] || {};
  const themeCues = theme.cues || {};
  const allowedPixels = new Set(Object.keys(artifact.visualLanguage.pixelAlphabet || {}));
  const payload = {
    artifactStatus: artifact.status,
    packKey: pack.metadata?.gameKey || '',
    visualCatalogKeys: Object.keys(visualCatalog),
    cueCatalogKeys: Object.keys(cueCatalog),
    themeCueKeys: Object.keys(themeCues),
    artifactSprites: artifact.visualLanguage?.sprites || [],
    artifactRequiredCues: artifact.audioLanguage?.requiredCueNames || [],
    runtimeCueMap: artifact.audioLanguage?.runtimeCueMap || {}
  };

  if(payload.packKey !== artifact.gameKey || payload.artifactStatus !== 'dev-preview-baseline-not-public-release-art'){
    fail('Galaxy Guardians identity artifact is not linked to the preview pack', payload);
  }
  for(const sprite of payload.artifactSprites){
    const runtime = visualCatalog[sprite.id];
    if(!runtime){
      fail(`Identity artifact sprite ${sprite.id} is missing from the pack visual catalog`, payload);
    }
    const runtimeRows = Array.from(runtime.pixelRows || []);
    if(JSON.stringify(runtimeRows) !== JSON.stringify(sprite.rows)){
      fail(`Identity artifact sprite ${sprite.id} no longer matches the pack visual rows`, { sprite, runtimeRows });
    }
    for(const row of runtimeRows){
      for(const pixel of row){
        if(!allowedPixels.has(pixel)){
          fail(`Identity sprite ${sprite.id} uses unregistered pixel token ${pixel}`, { sprite, row });
        }
      }
    }
    for(const forbidden of ['bee','butterfly','boss','capture','dual']){
      if(`${sprite.id} ${sprite.role} ${sprite.silhouette}`.toLowerCase().includes(forbidden)){
        fail(`Identity artifact sprite leaks Aurora-oriented naming: ${forbidden}`, sprite);
      }
    }
  }
  for(const cueName of payload.artifactRequiredCues){
    if(!payload.cueCatalogKeys.includes(cueName)){
      fail(`Identity artifact cue ${cueName} is missing from the pack audio cue catalog`, payload);
    }
    if(!payload.themeCueKeys.includes(cueName)){
      fail(`Identity artifact cue ${cueName} is missing from the Guardians signal audio theme`, payload);
    }
  }
  for(const [eventName, cueName] of Object.entries(payload.runtimeCueMap)){
    if(!adapterSource.includes(`event.type==='${eventName}'`) || !adapterSource.includes(`return '${cueName}'`)){
      fail(`Runtime cue map ${eventName} -> ${cueName} is not wired in the Guardians dev adapter`, payload);
    }
  }
  if(!adapterSource.includes('playGalaxyGuardiansRuntimeCues(GALAXY_GUARDIANS_ACTIVE_DEV_STATE)')){
    fail('Guardians dev adapter does not play mapped runtime cues after stepping the runtime', payload);
  }

  console.log(JSON.stringify({
    ok: true,
    artifact: path.relative(ROOT, ARTIFACT),
    sprites: payload.artifactSprites.map(sprite => sprite.id),
    cueCatalogKeys: payload.cueCatalogKeys,
    themeCueKeys: payload.themeCueKeys.filter(key => payload.artifactRequiredCues.includes(key))
  }, null, 2));
}

main();


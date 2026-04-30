#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function read(rel){
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function main(){
  const orchestrator = read('src/js/20-render.js');
  const auroraBoard = read('src/js/21-render-board.js');
  const guardiansBoard = read('src/js/22-galaxy-guardians-preview-renderer.js');
  const forbidden = [
    'Aurora',
    'AURORA',
    'Galaxy',
    'GUARDIANS',
    'drawAuroraBoard',
    'drawGalaxyGuardiansPreviewBoard',
    'shouldDrawGalaxyGuardiansPreviewBoard'
  ];
  const hits = forbidden.filter(token => orchestrator.includes(token));
  if(hits.length){
    fail('Platform render orchestration contains game-specific renderer branches', {
      file: 'src/js/20-render.js',
      forbiddenHits: hits
    });
  }
  for(const token of [
    'registerGameBoardRenderer',
    'availableGameBoardRenderers',
    'currentGameBoardRenderer',
    'boardRenderer.draw'
  ]){
    if(!orchestrator.includes(token)){
      fail(`Platform render orchestration is missing ${token}`, {
        file: 'src/js/20-render.js'
      });
    }
  }
  if(!auroraBoard.includes('registerGameBoardRenderer(AURORA_GAME_PACK.metadata.gameKey')){
    fail('Aurora board renderer is not registered through the platform renderer registry', {
      file: 'src/js/21-render-board.js'
    });
  }
  if(!guardiansBoard.includes('registerGameBoardRenderer(GALAXY_GUARDIANS_PACK.metadata.gameKey')){
    fail('Galaxy Guardians preview board renderer is not registered through the platform renderer registry', {
      file: 'src/js/22-galaxy-guardians-preview-renderer.js'
    });
  }
  if(!guardiansBoard.includes('previewOnly:true')){
    fail('Galaxy Guardians preview renderer must be marked preview-only', {
      file: 'src/js/22-galaxy-guardians-preview-renderer.js'
    });
  }
  if(!guardiansBoard.includes('currentGamePackHasPlayableAdapter')){
    fail('Galaxy Guardians preview renderer must keep its playable-adapter gate', {
      file: 'src/js/22-galaxy-guardians-preview-renderer.js'
    });
  }
  console.log(JSON.stringify({
    ok: true,
    checked: [
      'src/js/20-render.js',
      'src/js/21-render-board.js',
      'src/js/22-galaxy-guardians-preview-renderer.js'
    ]
  }, null, 2));
}

main();

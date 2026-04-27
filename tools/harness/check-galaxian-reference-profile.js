#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const PROFILE = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxian-reference', 'initial-measured-profile.json');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function main(){
  if(!fs.existsSync(PROFILE)) fail('Missing Galaxian initial measured profile. Run npm run harness:build:galaxian-reference-profile first.');
  const profile = readJson(PROFILE);
  if(profile.status !== 'source-manifested-contact-sheets-and-waveforms') fail('Unexpected profile status', profile);
  if(profile.application_target !== 'galaxy-guardians-preview') fail('Profile target is not Galaxy Guardians', profile);
  if(profile.source_count < 3 || !Array.isArray(profile.sources) || profile.sources.length < 3){
    fail('Profile does not include the expected three Galaxian sources', profile);
  }
  const roles = new Set(profile.sources.map(source => source.role));
  for(const role of ['arcade_intro_attract_and_opening', 'mid_wave_pressure_and_level_5_clear', 'long_session_wave_progression']){
    if(!roles.has(role)) fail(`Missing Galaxian source role: ${role}`, profile);
  }
  for(const source of profile.sources){
    for(const key of ['manifest', 'contact_sheet', 'waveform']){
      const artifact = source[key];
      if(!artifact || !fs.existsSync(path.join(ROOT, artifact))){
        fail(`Missing artifact ${key} for ${source.source_id}`, source);
      }
    }
    const media = source.measured_media || {};
    if(!(media.durationSeconds > 0 && media.width > 0 && media.height > 0 && media.hasAudio)){
      fail(`Incomplete measured media for ${source.source_id}`, source);
    }
  }
  const firstSlice = profile.measured_baseline && profile.measured_baseline.first_slice || {};
  if(firstSlice.player_fire_model !== 'single-shot') fail('Galaxian profile lost single-shot baseline', firstSlice);
  if(firstSlice.formation_model !== 'rack-with-independent-dives') fail('Galaxian profile lost formation baseline', firstSlice);
  if(firstSlice.flagship_model !== 'flagship-with-escort-pressure') fail('Galaxian profile lost flagship baseline', firstSlice);

  console.log(JSON.stringify({
    ok: true,
    sourceCount: profile.source_count,
    status: profile.status,
    firstSlice
  }, null, 2));
}

main();

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const PROFILE = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxian-reference', 'initial-measured-profile.json');
const PROMOTED_LOG = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaxian-reference', 'promoted-event-log.json');

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
  if(!fs.existsSync(PROMOTED_LOG)) fail('Missing Galaxian promoted event log. Run npm run harness:build:galaxian-reference-profile first.');
  const profile = readJson(PROFILE);
  const promotedLog = readJson(PROMOTED_LOG);
  if(profile.status !== 'source-manifested-contact-sheets-and-waveforms') fail('Unexpected profile status', profile);
  if(profile.application_target !== 'galaxy-guardians-preview') fail('Profile target is not Galaxy Guardians', profile);
  if(profile.promoted_event_log !== 'reference-artifacts/analyses/galaxian-reference/promoted-event-log.json'){
    fail('Profile does not cite the promoted event log', profile);
  }
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
  if(firstSlice.evidence_state !== 'promoted-event-log-awaiting-runtime-implementation'){
    fail('Galaxian profile is not advanced to the promoted event-log evidence state', firstSlice);
  }

  if(promotedLog.status !== 'promoted-reviewed-event-windows'){
    fail('Unexpected promoted Galaxian event log status', promotedLog);
  }
  if(promotedLog.application_target !== 'galaxy-guardians-preview'){
    fail('Promoted event log target is not Galaxy Guardians', promotedLog);
  }
  if(promotedLog.event_count < 11 || !Array.isArray(promotedLog.events) || promotedLog.events.length < 11){
    fail('Promoted Galaxian event log is missing expected scout-wave events', promotedLog);
  }
  const promotedTargets = new Set(promotedLog.events.map(event => event.promotion_target));
  for(const target of profile.next_promotion_targets){
    if(!promotedTargets.has(target)) fail(`Promoted event log is missing target ${target}`, promotedLog);
  }
  for(const event of promotedLog.events){
    if(event.confidence !== 'reviewed-contact-sheet') fail(`Promoted event lacks reviewed confidence: ${event.event_id}`, event);
    if(!Array.isArray(event.observed_window_seconds) || event.observed_window_seconds.length !== 2 || event.observed_window_seconds[1] <= event.observed_window_seconds[0]){
      fail(`Promoted event has invalid observed window: ${event.event_id}`, event);
    }
    const artifacts = event.evidence_artifacts || {};
    for(const key of ['contact_sheet', 'waveform']){
      if(!artifacts[key] || !fs.existsSync(path.join(ROOT, artifacts[key]))){
        fail(`Promoted event missing evidence artifact ${key}: ${event.event_id}`, event);
      }
    }
  }

  console.log(JSON.stringify({
    ok: true,
    sourceCount: profile.source_count,
    status: profile.status,
    promotedEventCount: promotedLog.event_count,
    firstSlice
  }, null, 2));
}

main();

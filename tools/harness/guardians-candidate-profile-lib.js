const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function readJson(file){
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function failProfile(message, payload){
  const detail = payload ? `\n${JSON.stringify(payload, null, 2)}` : '';
  throw new Error(`${message}${detail}`);
}

function validateGuardiansCandidateProfileSet(profile, file){
  const payload = { file: file ? rel(file) : '', artifactType: profile?.artifactType, status: profile?.status };
  if(profile?.gameKey !== 'galaxy-guardians-preview'){
    failProfile('Guardians candidate profile set is linked to the wrong game.', payload);
  }
  if(profile?.artifactType !== 'galaxy-guardians-candidate-profile-set'){
    failProfile('Guardians candidate profile set has the wrong artifact type.', payload);
  }
  if(profile?.status !== 'candidate-profile-contract-analysis-only'){
    failProfile('Guardians candidate profile set must remain analysis-only.', payload);
  }
  const gate = profile.promotionGate || {};
  if(gate.runtimeChangeAllowed !== false || gate.missilePaceLock !== true || gate.singleShotCadenceLock !== true){
    failProfile('Guardians candidate profile set must preserve no-runtime-change and pace locks.', gate);
  }
  const candidates = profile.candidates || [];
  if(candidates.length < 5){
    failProfile('Guardians candidate profile set needs the original candidates plus at least one expanded family.', { count: candidates.length });
  }
  const families = new Set((profile.families || []).map(row => row.id));
  if(!families.has('path-topology-lane-separation')){
    failProfile('Guardians candidate profile set is missing the path-topology-lane-separation family.', profile.families);
  }
  const ids = new Set();
  for(const candidate of candidates){
    if(!candidate.id || ids.has(candidate.id)) failProfile('Guardians candidate profile id is missing or duplicated.', candidate);
    ids.add(candidate.id);
    if(!candidate.label || !candidate.intent || !candidate.family || !families.has(candidate.family)){
      failProfile('Guardians candidate profile is missing review metadata.', candidate);
    }
    const patch = candidate.patch || {};
    if(patch.minRank !== profile.runtimeScope?.minRank || patch.maxRank !== profile.runtimeScope?.maxRank){
      failProfile('Guardians candidate profile patch is not scoped to the profile runtime rank.', { id: candidate.id, patch, runtimeScope: profile.runtimeScope });
    }
    const scales = patch.scales || {};
    const offsets = patch.offsets || {};
    const overrides = patch.overrides || {};
    for(const bucket of [scales, offsets]){
      for(const [key, value] of Object.entries(bucket)){
        if(!Number.isFinite(+value)) failProfile('Guardians candidate profile patch has a non-finite numeric value.', { id: candidate.id, key, value });
      }
    }
    if(Object.prototype.hasOwnProperty.call(scales, 'enemyShotVy') || Object.prototype.hasOwnProperty.call(scales, 'enemyShotIntervalBase') || Object.prototype.hasOwnProperty.call(scales, 'singleShotCooldown')){
      failProfile('Guardians candidate profile cannot scale missile pace or single-shot cadence.', { id: candidate.id, scales });
    }
    for(const forbidden of ['enemyShotVy', 'enemyShotIntervalBase', 'singleShotCooldown']){
      if(Object.prototype.hasOwnProperty.call(offsets, forbidden) || Object.prototype.hasOwnProperty.call(overrides, forbidden)){
        failProfile('Guardians candidate profile cannot offset or override missile pace or single-shot cadence.', { id: candidate.id, forbidden });
      }
    }
  }
  return profile;
}

function loadGuardiansCandidateProfileSet(file){
  return validateGuardiansCandidateProfileSet(readJson(file), file);
}

module.exports = {
  ROOT,
  rel,
  loadGuardiansCandidateProfileSet,
  validateGuardiansCandidateProfileSet
};

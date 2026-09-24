const fs = require('fs');

const REQUIRED_LAYERS = ['identity', 'stageArc', 'actors', 'movement', 'projectiles', 'scoring', 'presentation', 'promotion'];

function assert(condition, message, detail){
  if(!condition) throw new Error(`${message}${detail ? `\n${JSON.stringify(detail, null, 2)}` : ''}`);
}

function validatePlatinumGameProfile(profile, { expectedGameKey } = {}){
  assert(profile?.artifactType === 'platinum-game-definition-profile', 'Invalid Platinum game profile artifact type.', profile);
  assert(profile?.schemaVersion === '0.1', 'Unsupported Platinum game profile schema.', { schemaVersion: profile?.schemaVersion });
  assert(profile?.gameKey && (!expectedGameKey || profile.gameKey === expectedGameKey), 'Platinum game profile has the wrong game key.', { expectedGameKey, gameKey: profile?.gameKey });
  assert(profile?.execution?.mode === 'validated-pack-contract', 'Game profile must declare validated pack execution.', profile?.execution);
  for(const layer of REQUIRED_LAYERS) assert(profile.layers?.[layer], `Game profile is missing the ${layer} layer.`);
  assert(Array.isArray(profile.layers.stageArc.bands) && profile.layers.stageArc.bands.length > 0, 'Game profile needs at least one stage band.');
  assert(Array.isArray(profile.layers.actors.roles) && profile.layers.actors.roles.length > 0, 'Game profile needs actor roles.');
  assert(Array.isArray(profile.layers.movement.primitives) && profile.layers.movement.primitives.length > 0, 'Game profile needs movement primitives.');
  assert(profile.layers.projectiles.enemy?.speedPolicy, 'Game profile needs an enemy projectile speed policy.');
  assert(profile.layers.promotion.runtimeChangeAllowed === false, 'Candidate game profile must default to no runtime promotion.');
  assert(Array.isArray(profile.evidence?.sources) && profile.evidence.sources.length > 0, 'Game profile needs traceable evidence sources.');
  return profile;
}

function loadPlatinumGameProfile(file, options){
  return validatePlatinumGameProfile(JSON.parse(fs.readFileSync(file, 'utf8')), options);
}

module.exports = { REQUIRED_LAYERS, loadPlatinumGameProfile, validatePlatinumGameProfile };

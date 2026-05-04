const path = require('path');

const GAMES = {
  'galaxy-guardians-preview': {
    gameKey: 'galaxy-guardians-preview',
    gameLabel: 'Galaxy Guardians 0.1 Preview',
    packSource: 'src/js/13-galaxy-guardians-game-pack.js',
    packGlobal: 'GALAXY_GUARDIANS_PACK',
    themeId: 'guardians-signal',
    artifactDir: 'reference-artifacts/analyses/audio-conformance-lab/galaxy-guardians-preview',
    identityDir: 'reference-artifacts/analyses/galaxy-guardians-identity',
    labeledCueArtifact: 'reference-artifacts/analyses/galaxy-guardians-identity/audio-labeled-cue-targets-0.1.json',
    cueTargetArtifact: 'reference-artifacts/analyses/galaxy-guardians-identity/audio-cue-targets-0.1.json',
    cueCandidateArtifact: 'reference-artifacts/analyses/galaxy-guardians-identity/audio-isolated-cue-candidates-0.1.json',
    referenceConformanceArtifact: 'reference-artifacts/analyses/galaxy-guardians-identity/reference-conformance-0.1.json',
    playtestArtifact: 'reference-artifacts/analyses/galaxy-guardians-identity/playtest-conformance-review-0.1.json',
    runtimeCueNames: [
      'playerShot',
      'enemyShot',
      'scoutDive',
      'flagshipDive',
      'scoutHit',
      'escortHit',
      'flagshipHit',
      'playerLoss'
    ],
    scoring: {
      minimumOverallScore10: 6.0,
      compellingPreviewTarget10: 7.0,
      cuePassFloor10: 5.6
    }
  }
};

function gameConfig(gameKey){
  const config = GAMES[gameKey];
  if(!config){
    throw new Error(`Unknown audio conformance game "${gameKey}". Available: ${Object.keys(GAMES).join(', ')}`);
  }
  return Object.assign({}, config, {
    artifactPath: path.join(config.artifactDir, 'audio-conformance-lab-0.1.json'),
    reportPath: path.join(config.artifactDir, 'audio-conformance-lab-0.1.md')
  });
}

module.exports = { GAMES, gameConfig };

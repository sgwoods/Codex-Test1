const path = require('path');

function withPaths(config){
  const artifactDir = config.artifactDir;
  const identityDir = config.identityDir;
  return Object.assign({}, config, {
    artifactPath: path.join(artifactDir, 'audio-conformance-lab-0.1.json'),
    reportPath: path.join(artifactDir, 'audio-conformance-lab-0.1.md'),
    audioSceneReview: Object.assign({}, config.audioSceneReview || {}, {
      artifactPath: path.join(identityDir, 'audio-scene-review-0.1.json'),
      reportPath: path.join(identityDir, 'audio-scene-review-0.1.md')
    }),
    audioLiveMix: Object.assign({}, config.audioLiveMix || {}, {
      artifactPath: path.join(identityDir, 'audio-live-mix-0.1.json'),
      reportPath: path.join(identityDir, 'audio-live-mix-0.1.md')
    })
  });
}

const GAMES = {
  'galaxy-guardians-preview': withPaths({
    gameKey: 'galaxy-guardians-preview',
    gameLabel: 'Galaxy Guardians 0.1 Preview',
    packSource: 'src/js/13-galaxy-guardians-game-pack.js',
    packGlobal: 'GALAXY_GUARDIANS_PACK',
    themeId: 'guardians-signal',
    artifactDir: 'reference-artifacts/analyses/audio-conformance-lab/galaxy-guardians-preview',
    identityDir: 'reference-artifacts/analyses/galaxy-guardians-identity',
    captureDir: 'reference-artifacts/analyses/gameplay-segment-captures',
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
    },
    audioSceneReview: {
      minimumSceneCount: 6,
      previewDir: 'reference-artifacts/analyses/galaxy-guardians-identity/audio-scene-review-previews',
      scenes: [
        {
          id: 'launch-rack-establish',
          title: 'Launch / Rack Establish',
          captureLabel: 'guardians-opening-professional-review',
          runtimeStart: { seconds: 0.0 },
          runtimeEnd: { cue: 'stagePulse', occurrence: 1, offsetSeconds: 0.55, fallbackSeconds: 3.4 },
          targetRead: 'The start chirp should hand off quickly into a living rack cadence instead of dead air.',
          reference: {
            sourceId: 'galaxians-ex12mins',
            windowLabel: 'opening rack establish and restart cadence'
          }
        },
        {
          id: 'first-independent-dive-pressure',
          title: 'First Independent Dive Pressure',
          captureLabel: 'guardians-opening-professional-review',
          runtimeStart: { cue: 'scoutDive', occurrence: 1, offsetSeconds: -0.12, fallbackSeconds: 2.4 },
          runtimeEnd: { cueAny: ['enemyShot', 'stagePulse'], occurrence: 1, offsetSeconds: 0.6, fallbackSeconds: 4.8 },
          targetRead: 'The first real attack should sound like pressure arriving, not one isolated chirp over a quiet board.',
          reference: {
            sourceId: 'arcades-lounge-level-5',
            windowLabel: 'early dive and lower-field pressure arrival'
          }
        },
        {
          id: 'flagship-escort-warning',
          title: 'Flagship / Escort Warning',
          captureLabel: 'guardians-opening-professional-review',
          runtimeStart: { cue: 'flagshipDive', occurrence: 1, offsetSeconds: -0.14, fallbackSeconds: 6.2 },
          runtimeEnd: { cueAny: ['escortJoin', 'enemyShot'], occurrence: 1, offsetSeconds: 0.55, fallbackSeconds: 7.9 },
          targetRead: 'The command dive should feel larger than a scout dive and should clearly telegraph escort pressure.',
          reference: {
            sourceId: 'nenriki-15-wave-session',
            windowLabel: 'flagship-plus-escort warning pass'
          }
        },
        {
          id: 'opening-hit-payoff',
          title: 'Opening Hit / Score Payoff',
          captureLabel: 'guardians-opening-professional-review',
          runtimeStart: { cueAny: ['scoutHit', 'escortHit', 'flagshipHit'], occurrence: 1, offsetSeconds: -0.08, fallbackSeconds: 8.0 },
          runtimeEnd: { cueAny: ['scoutHit', 'escortHit', 'flagshipHit'], occurrence: 1, offsetSeconds: 0.38, fallbackSeconds: 8.45 },
          targetRead: 'Successful shots should feel rewarding and final enough to read as real arcade feedback in live play.',
          reference: {
            sourceId: 'arcades-lounge-level-5',
            windowLabel: 'opening hit confirmation and payoff moment'
          }
        },
        {
          id: 'player-loss-read',
          title: 'Player Loss Read',
          captureLabel: 'guardians-opening-professional-review',
          runtimeStart: { cue: 'playerLoss', occurrence: 1, offsetSeconds: -0.14, fallbackSeconds: 13.5 },
          runtimeEnd: { cue: 'playerLoss', occurrence: 1, offsetSeconds: 0.75, fallbackSeconds: 14.4 },
          targetRead: 'A ship loss should be unmistakable and feel more emotionally final than normal hit feedback.',
          reference: {
            sourceId: 'nenriki-15-wave-session',
            windowLabel: 'player loss and failure punctuation'
          }
        },
        {
          id: 'midrun-stage5-pressure',
          title: 'Midrun Stage 5 Pressure',
          captureLabel: 'guardians-stage5-professional-review',
          runtimeStart: { cueAny: ['scoutDive', 'enemyShot'], occurrence: 1, offsetSeconds: -0.1, fallbackSeconds: 1.8 },
          runtimeEnd: { cue: 'stagePulse', occurrence: 3, offsetSeconds: 0.45, fallbackSeconds: 8.6 },
          targetRead: 'Stage-five pressure should sound denser and more insistent than the opening board without collapsing into clutter.',
          reference: {
            sourceId: 'arcades-lounge-level-5',
            windowLabel: 'mid-wave pressure bed and shot/dive layering'
          }
        }
      ]
    },
    audioLiveMix: {
      minimumOverallScore10: 6.0,
      previewDir: 'reference-artifacts/analyses/galaxy-guardians-identity/audio-live-mix-previews',
      sliceSeconds: 5,
      pressureCues: ['stagePulse', 'scoutDive', 'flagshipDive', 'escortJoin', 'enemyShot'],
      rewardCues: ['scoutHit', 'escortHit', 'flagshipHit'],
      criticalCues: ['gameStart', 'stagePulse', 'playerShot', 'enemyShot', 'scoutDive', 'flagshipDive', 'playerLoss'],
      captureSets: [
        {
          id: 'opening-professional',
          label: 'guardians-opening-professional-review',
          expectedStage: 1,
          persona: 'professional',
          targetRead: 'Opening board must sound alive quickly and stay under audible pressure.',
          thresholds: {
            maxQuietGapSeconds: 4.6,
            minCueEventsPer10s: 5.5,
            minPressureCueShare: 0.28,
            minPulseCount: 2,
            minActiveSliceShare: 0.5
          }
        },
        {
          id: 'midrun-professional',
          label: 'guardians-stage5-professional-review',
          expectedStage: 5,
          persona: 'professional',
          targetRead: 'Midrun board should be denser and more threatening than opening without going mushy or silent.',
          thresholds: {
            maxQuietGapSeconds: 3.6,
            minCueEventsPer10s: 7.0,
            minPressureCueShare: 0.42,
            minPulseCount: 3,
            minActiveSliceShare: 0.62
          }
        }
      ]
    }
  })
};

function gameConfig(gameKey){
  const config = GAMES[gameKey];
  if(!config){
    throw new Error(`Unknown audio conformance game "${gameKey}". Available: ${Object.keys(GAMES).join(', ')}`);
  }
  return config;
}

module.exports = { GAMES, gameConfig };

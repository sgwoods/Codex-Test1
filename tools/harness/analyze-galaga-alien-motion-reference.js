#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_SOURCE = path.join(
  ROOT,
  'reference-artifacts',
  'ingestion',
  'galaga-alien-motion-reference',
  'source-video',
  'galaga-alien-pulse-reference.mp4'
);
const sourceVideo = path.resolve(process.env.GALAGA_ALIEN_MOTION_SOURCE || DEFAULT_SOURCE);
const analysisDir = path.join(ROOT, 'reference-artifacts', 'analyses', 'galaga-alien-motion-reference');
const mediaDir = path.join(analysisDir, 'latest-media');
const latestJson = path.join(analysisDir, 'latest.json');
const reportPath = path.join(ROOT, 'GALAGA_ALIEN_MOTION_REFERENCE.md');

function rel(file){
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function mkdirp(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function run(command, args){
  execFileSync(command, args, { cwd: ROOT, stdio: 'pipe' });
}

function readProbe(file){
  const raw = execFileSync('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration:stream=codec_name,width,height,r_frame_rate,nb_frames',
    '-of', 'json',
    file
  ], { encoding: 'utf8' });
  return JSON.parse(raw);
}

function writeJson(file, value){
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function writeReport(artifact){
  const roles = artifact.roleTaxonomy.map(role => (
    `| ${role.label} | \`${role.roleKey}\` | ${role.referenceUse} | ${role.nextExtraction} |`
  )).join('\n');
  const lines = [
    '# Galaga Alien Motion Reference',
    '',
    artifact.summary,
    '',
    `Generated: ${artifact.generatedAt}`,
    '',
    '## Source',
    '',
    `- Source video: \`${artifact.sourceVideo}\``,
    `- Duration: ${artifact.video.durationSeconds}s`,
    `- Frame size: ${artifact.video.width}x${artifact.video.height}`,
    `- Frame rate: ${artifact.video.frameRate}`,
    '',
    '## Review Media',
    '',
    `- Contact sheet: \`${artifact.media.contactSheet}\``,
    `- Motion sheet: \`${artifact.media.motionSheet}\``,
    '',
    '## Role Taxonomy',
    '',
    '| Role | Key | Reference Use | Next Extraction |',
    '|---|---|---|---|',
    roles,
    '',
    '## Conformance Read',
    '',
    artifact.conformanceRead,
    '',
    '## Next Best Step',
    '',
    artifact.nextBestStep,
    ''
  ];
  fs.writeFileSync(reportPath, lines.join('\n'));
}

function frameRateString(value){
  const str = String(value || '');
  const match = str.match(/^(\d+)\/(\d+)$/);
  if(!match) return str || 'unknown';
  const num = Number(match[1]);
  const den = Number(match[2]);
  if(!den) return str;
  return `${+(num / den).toFixed(3)} fps`;
}

function main(){
  if(!fs.existsSync(sourceVideo)){
    console.error(`Missing source video: ${sourceVideo}`);
    process.exit(1);
  }
  mkdirp(mediaDir);

  const contactSheet = path.join(mediaDir, 'alien-pulse-contact-sheet-1fps.png');
  const motionSheet = path.join(mediaDir, 'alien-pulse-motion-sheet-2fps.png');
  run('ffmpeg', [
    '-y',
    '-i', sourceVideo,
    '-vf', 'fps=1,scale=180:180:flags=neighbor,tile=5x5:margin=8:padding=4:color=0x101820',
    '-frames:v', '1',
    contactSheet
  ]);
  run('ffmpeg', [
    '-y',
    '-i', sourceVideo,
    '-vf', 'fps=2,scale=128:128:flags=neighbor,tile=10x5:margin=6:padding=3:color=0x101820',
    '-frames:v', '1',
    motionSheet
  ]);

  const probe = readProbe(sourceVideo);
  const videoStream = (probe.streams || []).find(stream => Number(stream.width) && Number(stream.height)) || {};
  const artifact = {
    artifactType: 'galaga-alien-motion-reference',
    version: '0.1',
    generatedAt: new Date().toISOString(),
    status: 'ingested-reference-motion-taxonomy',
    summary: 'User-supplied Galaga alien motion/pulse video ingested as a durable sprite-motion reference for taxonomy, pulse cadence, and clean role-silhouette review.',
    sourceVideo: rel(sourceVideo),
    report: rel(reportPath),
    video: {
      durationSeconds: +(Number(probe.format?.duration || 0).toFixed(3)),
      width: Number(videoStream.width || 0),
      height: Number(videoStream.height || 0),
      frameRate: frameRateString(videoStream.r_frame_rate),
      frameCount: Number(videoStream.nb_frames || 0),
      sourceAuthority: 'user-supplied segmented Galaga alien movement reference'
    },
    media: {
      contactSheet: rel(contactSheet),
      motionSheet: rel(motionSheet),
      inlineVideo: rel(sourceVideo)
    },
    roleTaxonomy: [
      {
        roleKey: 'player-fighter',
        label: 'Fighter',
        aliases: ['Player fighter', 'captured fighter', 'dual fighter'],
        referenceUse: 'Clean player silhouette, red/white/blue color placement, capture/rescue meaning, dual-fighter context.',
        nextExtraction: 'Extract front, captured-red, and dual-fighter pulse/context crops.'
      },
      {
        roleKey: 'bee-zako',
        label: 'Bee',
        aliases: ['Zako', 'attack drone'],
        referenceUse: 'Formation drone role, flank/wing pulse, small high-count enemy identity.',
        nextExtraction: 'Extract closed/open pulse frames and score against Aurora bee-line cadence.'
      },
      {
        roleKey: 'butterfly-escort',
        label: 'Butterfly',
        aliases: ['Leader convoy', 'escort'],
        referenceUse: 'Red/white/blue block silhouette and leader-escort pulse identity.',
        nextExtraction: 'Extract closed/open pulse frames and dive silhouette target.'
      },
      {
        roleKey: 'boss-galaga',
        label: 'Boss',
        aliases: ['Boss Galaga', 'squad leader'],
        referenceUse: 'Boss wing/body shape, open/closed pulse, capture-beam host context, two-hit target identity.',
        nextExtraction: 'Replace polluted boss crop targets with clean pulse frames and damage-state placeholders.'
      },
      {
        roleKey: 'scorpion',
        label: 'Scorpion',
        aliases: ['Morph target'],
        referenceUse: 'Later-round morph target taxonomy and distinctive yellow/cyan/red silhouette.',
        nextExtraction: 'Extract morph target front pose and any pulse frame available.'
      },
      {
        roleKey: 'bosconian',
        label: 'Bosconian-style morph',
        aliases: ['Bosconian', 'green morph target'],
        referenceUse: 'Later-round morph novelty role and green/yellow/red color grammar.',
        nextExtraction: 'Extract front pose for role taxonomy and future morph scoring.'
      },
      {
        roleKey: 'galaxian',
        label: 'Galaxian',
        aliases: ['Galaxian morph target'],
        referenceUse: 'Later-round morph novelty and classic Galaxian callback silhouette.',
        nextExtraction: 'Extract front pose and compare to Aurora specialty enemy families.'
      },
      {
        roleKey: 'dragonfly',
        label: 'Dragonfly',
        aliases: ['Challenge-round bonus target'],
        referenceUse: 'Challenge-only alien identity and non-combat bonus-stage target shape.',
        nextExtraction: 'Extract front pose and challenge-stage movement/pulse sample.'
      },
      {
        roleKey: 'satellite',
        label: 'Satellite',
        aliases: ['Challenge-round bonus target'],
        referenceUse: 'Challenge-only alien identity, rotation-like silhouette, and late-stage novelty.',
        nextExtraction: 'Extract front/rotation pulse sequence for challenge-stage scoring.'
      },
      {
        roleKey: 'starship',
        label: 'Starship',
        aliases: ['Challenge-round bonus target'],
        referenceUse: 'Challenge-only alien identity and large blue/red target silhouette.',
        nextExtraction: 'Extract front pose and compare against Aurora challenge-mosquito/starship proxies.'
      },
      {
        roleKey: 'tractor-beam',
        label: 'Tractor Beam',
        aliases: ['Capture beam'],
        referenceUse: 'Beam geometry and capture-state screen grammar.',
        nextExtraction: 'Extract beam width sequence for capture lifecycle visual scoring.'
      }
    ],
    conformanceRead: 'This artifact is stronger for human-readable taxonomy, pulse cadence, and clean silhouette targets than the currently polluted crop boxes in some rows. It should not replace source-sheet exact crops alone; it should validate and correct target crops, then seed temporal pulse/cadence scoring.',
    nextBestStep: 'Use the motion sheet to extract clean per-role pulse pairs for Bee, Butterfly, and Boss first; then regenerate the runtime-vs-target table so bad crop boxes cannot masquerade as sprite conformance evidence.'
  };

  writeJson(latestJson, artifact);
  writeReport(artifact);
  console.log(JSON.stringify({ ok: true, artifact: rel(latestJson), report: rel(reportPath) }, null, 2));
}

main();

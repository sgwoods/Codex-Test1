const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { ROOT, DIST_DEV, DEV_BUILD_INFO } = require('../build/paths');

const DIST_REFERENCE_AUDIO_ROOT = path.join(DIST_DEV, 'assets', 'reference-audio');
const PRIVATE_STORAGE_MANIFEST = path.join(ROOT, 'src', 'assets', 'reference-audio', 'private-storage.json');
const LOCAL_AUDIO_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);
const REQUIRED_CUE_CLIPS = Object.freeze({
  attackCharge: Object.freeze(['galaga3-attack-charger.m4a']),
  enemyShot: Object.freeze(['galaga3-boss-damage-flagship-fighter-shot.m4a']),
  enemyHit: Object.freeze(['galaga3-zako.m4a']),
  enemyBoom: Object.freeze(['galaga3-zako.m4a']),
  bossHit: Object.freeze(['galaga3-boss-damage-flagship-fighter-shot.m4a']),
  bossBoom: Object.freeze(['galaga3-boss-death-sasori.m4a']),
  playerShot: Object.freeze(['galaga3-boss-damage-flagship-fighter-shot.m4a']),
  stagePulse: Object.freeze(['galaga3-ambience-convoy.m4a'])
});

function rel(file){
  if(!file) return '';
  const relative = path.relative(ROOT, file);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
    ? relative.split(path.sep).join('/')
    : file;
}

function unique(values){
  return Array.from(new Set(values.filter(Boolean)));
}

function readJsonIfExists(file){
  try{
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }catch{
    return null;
  }
}

function sha256(file){
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function safeStat(file){
  try{
    return fs.statSync(file);
  }catch{
    return null;
  }
}

function safeLstat(file){
  try{
    return fs.lstatSync(file);
  }catch{
    return null;
  }
}

function safeRealpath(file){
  try{
    return fs.realpathSync(file);
  }catch{
    return '';
  }
}

function gitIgnored(file){
  const relative = rel(file);
  if(!relative || path.isAbsolute(relative)) return false;
  const result = spawnSync('git', ['check-ignore', '-q', relative], {
    cwd: ROOT,
    stdio: 'ignore'
  });
  return result.status === 0;
}

function loadPrivateStorageManifest(){
  const manifest = readJsonIfExists(PRIVATE_STORAGE_MANIFEST);
  const byFileName = new Map();
  for(const entry of Array.isArray(manifest?.moved_files) ? manifest.moved_files : []){
    const fileName = path.basename(String(entry.publicRepoPath || entry.privateStorePath || ''));
    if(fileName) byFileName.set(fileName, entry);
  }
  return {
    ok: Boolean(manifest),
    path: PRIVATE_STORAGE_MANIFEST,
    relPath: rel(PRIVATE_STORAGE_MANIFEST),
    privateRoot: manifest?.private_root || '',
    movedFileCount: manifest?.moved_file_count || 0,
    byFileName
  };
}

function requiredFiles(){
  return unique(Object.values(REQUIRED_CUE_CLIPS).flat());
}

function normalizeCandidateRoot(value){
  const raw = String(value || '').trim();
  if(!raw) return '';
  return path.resolve(ROOT, raw);
}

function privateSourceCandidates(manifest){
  const candidates = [
    ['env:AURORA_PRIVATE_REFERENCE_AUDIO_ROOT', process.env.AURORA_PRIVATE_REFERENCE_AUDIO_ROOT],
    ['env:AURORA_REFERENCE_AUDIO_ROOT', process.env.AURORA_REFERENCE_AUDIO_ROOT],
    ['manifest:private_root', manifest.privateRoot]
  ]
    .map(([label, value]) => ({ label, root: normalizeCandidateRoot(value) }))
    .filter(candidate => candidate.root);
  const seen = new Set();
  return candidates.filter(candidate => {
    const key = path.resolve(candidate.root);
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function fileRead(root, fileName, manifest){
  const file = path.join(root, fileName);
  const stat = safeStat(file);
  const expected = manifest.byFileName.get(fileName) || null;
  const readable = Boolean(stat && stat.isFile());
  let actualSha256 = '';
  let hashMatches = false;
  if(readable){
    try{
      actualSha256 = sha256(file);
      hashMatches = !expected?.sha256 || actualSha256 === expected.sha256;
    }catch{
      actualSha256 = '';
      hashMatches = false;
    }
  }
  const sizeMatches = !expected?.bytes || (readable && stat.size === expected.bytes);
  return {
    file: fileName,
    path: rel(file),
    readable,
    bytes: readable ? stat.size : 0,
    expectedBytes: expected?.bytes || null,
    sizeMatches,
    sha256Matches: hashMatches,
    ok: readable && sizeMatches && hashMatches
  };
}

function rootRead(label, root, manifest){
  const lstat = safeLstat(root);
  const exists = Boolean(lstat);
  const files = requiredFiles().map(fileName => fileRead(root, fileName, manifest));
  const missing = files.filter(file => !file.readable).map(file => file.file);
  const mismatched = files.filter(file => file.readable && !file.ok).map(file => file.file);
  return {
    label,
    root: rel(root),
    exists,
    isSymlink: Boolean(lstat?.isSymbolicLink()),
    isDirectory: Boolean(lstat?.isDirectory()),
    symlinkTarget: lstat?.isSymbolicLink() ? fs.readlinkSync(root) : '',
    resolvedPath: safeRealpath(root),
    gitIgnored: exists ? gitIgnored(root) : gitIgnored(path.dirname(root)),
    files,
    missing,
    mismatched,
    allRequiredReadable: missing.length === 0,
    allRequiredHashMatch: missing.length === 0 && mismatched.length === 0,
    ok: missing.length === 0 && mismatched.length === 0
  };
}

function referenceAudioAvailableForHost(buildInfo, host){
  if(!buildInfo) return null;
  if(!buildInfo.publicArtifactBoundaryEnabled) return true;
  const normalized = String(host || '').toLowerCase();
  return buildInfo.releaseChannel === 'development' && LOCAL_AUDIO_HOSTS.has(normalized);
}

function publicBoundaryStatus(){
  const buildInfo = readJsonIfExists(DEV_BUILD_INFO);
  const localhostReferenceAudioAvailable = referenceAudioAvailableForHost(buildInfo, 'localhost');
  const publicSafeReferenceAudioAvailable = referenceAudioAvailableForHost(buildInfo, 'aurora-public.localhost');
  return {
    buildInfoPath: rel(DEV_BUILD_INFO),
    buildInfoPresent: Boolean(buildInfo),
    releaseChannel: buildInfo?.releaseChannel || '',
    publicArtifactBoundaryEnabled: buildInfo?.publicArtifactBoundaryEnabled ?? null,
    localhostReferenceAudioAvailable,
    publicSafeHost: 'aurora-public.localhost',
    publicSafeReferenceAudioAvailable,
    publicSafePrivateClipLeakPass: publicSafeReferenceAudioAvailable === false
  };
}

function repairDistReferenceAudio(manifest, currentDistRead){
  if(currentDistRead.ok){
    return { attempted: false, changed: false, reason: 'dist reference audio already complete' };
  }
  const parent = path.dirname(DIST_REFERENCE_AUDIO_ROOT);
  const distLstat = safeLstat(DIST_REFERENCE_AUDIO_ROOT);
  if(distLstat){
    return {
      attempted: false,
      changed: false,
      reason: 'dist reference audio path already exists but is incomplete; refusing to overwrite a local path automatically'
    };
  }
  const source = privateSourceCandidates(manifest)
    .map(candidate => ({ candidate, read: rootRead(candidate.label, candidate.root, manifest) }))
    .find(entry => entry.read.ok);
  if(!source){
    return {
      attempted: false,
      changed: false,
      reason: 'no complete private reference-audio source root was found'
    };
  }
  fs.mkdirSync(parent, { recursive: true });
  fs.symlinkSync(source.candidate.root, DIST_REFERENCE_AUDIO_ROOT, 'dir');
  return {
    attempted: true,
    changed: true,
    source: source.read.root,
    target: rel(DIST_REFERENCE_AUDIO_ROOT),
    reason: 'created local-only dist/dev/assets/reference-audio symlink'
  };
}

function nextActions(status){
  if(status.ok) return [];
  const actions = [];
  if(!status.publicBoundary.buildInfoPresent){
    actions.push('Run npm run build so dist/dev/build-info.json exists before checking localhost reference-audio provisioning.');
  }
  if(status.publicBoundary.publicSafePrivateClipLeakPass !== true){
    actions.push('Investigate referenceAudioPubliclyAvailable/publicArtifactBoundaryEnabled before changing local asset provisioning.');
  }
  if(status.publicBoundary.localhostReferenceAudioAvailable && !status.distReferenceAudio.ok){
    const completeSource = status.sourceCandidates.find(candidate => candidate.ok);
    if(completeSource){
      actions.push('Run npm run machine:audio:bootstrap to create the ignored local dist/dev/assets/reference-audio symlink.');
    } else {
      actions.push('Set AURORA_PRIVATE_REFERENCE_AUDIO_ROOT to a local private reference-audio directory, then run npm run machine:audio:bootstrap.');
    }
  }
  return actions;
}

function privateReferenceAudioStatus(options = {}){
  const manifest = loadPrivateStorageManifest();
  let distReferenceAudio = rootRead('dist-dev-reference-audio', DIST_REFERENCE_AUDIO_ROOT, manifest);
  const repair = options.repair ? repairDistReferenceAudio(manifest, distReferenceAudio) : null;
  if(repair?.changed){
    distReferenceAudio = rootRead('dist-dev-reference-audio', DIST_REFERENCE_AUDIO_ROOT, manifest);
  }
  const sourceCandidates = privateSourceCandidates(manifest)
    .map(candidate => rootRead(candidate.label, candidate.root, manifest));
  const publicBoundary = publicBoundaryStatus();
  const localhostEnabled = publicBoundary.localhostReferenceAudioAvailable === true;
  const issues = [];
  if(!manifest.ok) issues.push('private reference-audio manifest is missing');
  if(publicBoundary.buildInfoPresent !== true) issues.push('dist/dev build-info is missing; run npm run build');
  if(publicBoundary.publicSafePrivateClipLeakPass !== true) issues.push('public-safe host simulation would expose private reference audio');
  if(localhostEnabled && !distReferenceAudio.ok) issues.push('localhost reference cue resolution is enabled but required private audio files are missing or mismatched');
  const status = {
    ok: issues.length === 0,
    artifactType: 'private-reference-audio-provisioning-status',
    generatedAt: new Date().toISOString(),
    root: ROOT,
    requiredCues: REQUIRED_CUE_CLIPS,
    requiredFiles: requiredFiles(),
    manifest: {
      ok: manifest.ok,
      path: manifest.relPath,
      privateRoot: manifest.privateRoot,
      movedFileCount: manifest.movedFileCount
    },
    publicBoundary,
    distReferenceAudio,
    sourceCandidates,
    repair,
    issues
  };
  status.next = nextActions(status);
  return status;
}

module.exports = {
  DIST_REFERENCE_AUDIO_ROOT,
  REQUIRED_CUE_CLIPS,
  privateReferenceAudioStatus,
  referenceAudioAvailableForHost
};

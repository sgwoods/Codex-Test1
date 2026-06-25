const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');

const ARTIFACT_MANIFESTS = Object.freeze([
  {
    key: 'galaga-alien-target-crops',
    label: 'Galaga alien target crops',
    manifest: 'reference-artifacts/analyses/galaga-alien-target-crops/private-storage.json',
    expectedSubdir: 'latest-crops'
  },
  {
    key: 'galaga-alien-frame-cadence-targets',
    label: 'Galaga alien frame cadence targets',
    manifest: 'reference-artifacts/analyses/galaga-alien-frame-cadence-targets/private-storage.json',
    expectedSubdir: 'latest-frames'
  }
]);

function rel(file){
  if(!file) return '';
  const relative = path.relative(ROOT, file);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
    ? relative.split(path.sep).join('/')
    : file;
}

function abs(relPath){
  return path.resolve(ROOT, relPath);
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

function normalizeCandidateRoot(value){
  const raw = String(value || '').trim();
  if(!raw) return '';
  return path.resolve(ROOT, raw);
}

function uniqueCandidates(candidates){
  const seen = new Set();
  return candidates
    .map(candidate => ({ ...candidate, root: normalizeCandidateRoot(candidate.root) }))
    .filter(candidate => {
      if(!candidate.root) return false;
      const key = path.resolve(candidate.root);
      if(seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function loadManifest(spec){
  const manifestPath = abs(spec.manifest);
  const manifest = readJsonIfExists(manifestPath);
  const movedFiles = Array.isArray(manifest?.moved_files) ? manifest.moved_files : [];
  return {
    ok: Boolean(manifest),
    spec,
    manifest,
    path: manifestPath,
    relPath: rel(manifestPath),
    privateRoot: manifest?.private_root || '',
    publicMetadataRoot: manifest?.public_metadata_root || '',
    movedFileCount: manifest?.moved_file_count || movedFiles.length,
    movedFiles
  };
}

function fileRead(entry){
  const file = abs(entry.privateStorePath || '');
  const stat = safeStat(file);
  const readable = Boolean(stat && stat.isFile());
  let actualSha256 = '';
  let sha256Matches = false;
  if(readable){
    try{
      actualSha256 = sha256(file);
      sha256Matches = !entry.sha256 || actualSha256 === entry.sha256;
    }catch{
      actualSha256 = '';
      sha256Matches = false;
    }
  }
  const sizeMatches = !entry.bytes || (readable && stat.size === entry.bytes);
  return {
    publicRepoPath: entry.publicRepoPath || '',
    privateStorePath: entry.privateStorePath || '',
    path: rel(file),
    readable,
    bytes: readable ? stat.size : 0,
    expectedBytes: entry.bytes || null,
    sizeMatches,
    sha256Matches,
    ok: readable && sizeMatches && sha256Matches
  };
}

function manifestRead(manifestInfo){
  const files = manifestInfo.movedFiles.map(fileRead);
  const missing = files.filter(file => !file.readable);
  const mismatched = files.filter(file => file.readable && !file.ok);
  const privateRootAbs = manifestInfo.privateRoot ? abs(manifestInfo.privateRoot) : '';
  const rootLstat = privateRootAbs ? safeLstat(privateRootAbs) : null;
  return {
    key: manifestInfo.spec.key,
    label: manifestInfo.spec.label,
    ok: manifestInfo.ok && files.length > 0 && missing.length === 0 && mismatched.length === 0,
    manifestPresent: manifestInfo.ok,
    manifestPath: manifestInfo.relPath,
    privateRoot: manifestInfo.privateRoot,
    privateRootExists: Boolean(rootLstat),
    privateRootIsSymlink: Boolean(rootLstat?.isSymbolicLink()),
    privateRootSymlinkTarget: rootLstat?.isSymbolicLink() ? fs.readlinkSync(privateRootAbs) : '',
    privateRootResolvedPath: safeRealpath(privateRootAbs),
    privateRootGitIgnored: privateRootAbs ? gitIgnored(privateRootAbs) : false,
    movedFileCount: manifestInfo.movedFileCount,
    checkedFileCount: files.length,
    readableFileCount: files.filter(file => file.readable).length,
    missingCount: missing.length,
    mismatchedCount: mismatched.length,
    missing: missing.slice(0, 12).map(file => file.privateStorePath),
    mismatched: mismatched.slice(0, 12).map(file => ({
      privateStorePath: file.privateStorePath,
      bytes: file.bytes,
      expectedBytes: file.expectedBytes,
      sizeMatches: file.sizeMatches,
      sha256Matches: file.sha256Matches
    }))
  };
}

function artifactDirFromCandidate(root, manifestInfo){
  const candidates = [
    path.join(root, manifestInfo.privateRoot),
    path.join(root, manifestInfo.publicMetadataRoot),
    path.join(root, 'repo-mirror', manifestInfo.publicMetadataRoot),
    path.join(root, 'reference-artifacts', 'analyses', manifestInfo.spec.key),
    path.join(root, manifestInfo.spec.key),
    root
  ];
  for(const candidate of candidates){
    const firstEntry = manifestInfo.movedFiles[0] || null;
    const firstPrivateSuffix = firstEntry?.privateStorePath
      ? path.relative(manifestInfo.privateRoot, firstEntry.privateStorePath)
      : '';
    const firstPublicSuffix = firstEntry?.publicRepoPath && manifestInfo.publicMetadataRoot
      ? path.relative(manifestInfo.publicMetadataRoot, firstEntry.publicRepoPath)
      : '';
    const probeFiles = [
      firstPrivateSuffix ? path.join(candidate, firstPrivateSuffix) : '',
      firstPublicSuffix ? path.join(candidate, firstPublicSuffix) : '',
      path.join(candidate, manifestInfo.spec.expectedSubdir)
    ].filter(Boolean);
    if(probeFiles.some(probe => Boolean(safeStat(probe)))){
      return candidate;
    }
  }
  return '';
}

function readCandidate(label, root, manifestInfo){
  const artifactDir = artifactDirFromCandidate(root, manifestInfo);
  const files = [];
  if(artifactDir){
    for(const entry of manifestInfo.movedFiles){
      const privateSuffix = path.relative(manifestInfo.privateRoot, entry.privateStorePath || '');
      const publicSuffix = manifestInfo.publicMetadataRoot
        ? path.relative(manifestInfo.publicMetadataRoot, entry.publicRepoPath || '')
        : '';
      const localFile = safeStat(path.join(artifactDir, privateSuffix))
        ? path.join(artifactDir, privateSuffix)
        : path.join(artifactDir, publicSuffix);
      const stat = safeStat(localFile);
      const readable = Boolean(stat && stat.isFile());
      let hashMatches = false;
      if(readable){
        try{
          hashMatches = !entry.sha256 || sha256(localFile) === entry.sha256;
        }catch{
          hashMatches = false;
        }
      }
      files.push({
        file: path.basename(entry.privateStorePath || entry.publicRepoPath || ''),
        readable,
        sizeMatches: !entry.bytes || (readable && stat.size === entry.bytes),
        sha256Matches: hashMatches
      });
    }
  }
  const missing = files.filter(file => !file.readable);
  const mismatched = files.filter(file => file.readable && (!file.sizeMatches || !file.sha256Matches));
  return {
    label,
    root: rel(root),
    artifactDir: rel(artifactDir),
    exists: Boolean(safeStat(root)),
    artifactDirExists: Boolean(artifactDir),
    checkedFileCount: files.length,
    readableFileCount: files.filter(file => file.readable).length,
    missingCount: missing.length,
    mismatchedCount: mismatched.length,
    ok: manifestInfo.ok && files.length === manifestInfo.movedFiles.length && missing.length === 0 && mismatched.length === 0
  };
}

function sourceCandidates(manifestInfo){
  const candidates = uniqueCandidates([
    { label: 'env:AURORA_PRIVATE_VISUAL_TARGET_ROOT', root: process.env.AURORA_PRIVATE_VISUAL_TARGET_ROOT },
    { label: 'env:AURORA_PRIVATE_ARTIFACT_ROOT', root: process.env.AURORA_PRIVATE_ARTIFACT_ROOT },
    { label: 'env:AURORA_PRIVATE_REPO_MIRROR_ROOT', root: process.env.AURORA_PRIVATE_REPO_MIRROR_ROOT },
    { label: 'manifest:private_root', root: manifestInfo.privateRoot }
  ]);
  return candidates.map(candidate => readCandidate(candidate.label, candidate.root, manifestInfo));
}

function repairManifest(manifestInfo, currentRead, candidates){
  if(currentRead.ok){
    return { attempted: false, changed: false, reason: `${manifestInfo.spec.key} already complete` };
  }
  if(!manifestInfo.ok){
    return { attempted: false, changed: false, reason: `${manifestInfo.spec.key} private-storage manifest is missing` };
  }
  const target = abs(manifestInfo.privateRoot);
  const targetLstat = safeLstat(target);
  if(targetLstat){
    return {
      attempted: false,
      changed: false,
      reason: `${manifestInfo.spec.key} private root already exists but is incomplete; refusing to overwrite a local path automatically`
    };
  }
  const source = candidates.find(candidate => candidate.ok && candidate.artifactDir);
  if(!source){
    return {
      attempted: false,
      changed: false,
      reason: `no complete private source root was found for ${manifestInfo.spec.key}`
    };
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.symlinkSync(path.resolve(ROOT, source.artifactDir), target, 'dir');
  return {
    attempted: true,
    changed: true,
    source: source.artifactDir,
    target: rel(target),
    reason: `created ignored private-artifacts symlink for ${manifestInfo.spec.key}`
  };
}

function persistDestinationRoot(){
  return normalizeCandidateRoot(
    process.env.AURORA_PRIVATE_VISUAL_TARGET_PERSIST_ROOT
    || process.env.AURORA_PRIVATE_ARTIFACT_ROOT
    || process.env.AURORA_PRIVATE_VISUAL_TARGET_ROOT
  );
}

function persistManifest(manifestInfo, currentRead, destinationRoot){
  if(!destinationRoot){
    return {
      attempted: false,
      changed: false,
      reason: 'set AURORA_PRIVATE_VISUAL_TARGET_PERSIST_ROOT or AURORA_PRIVATE_ARTIFACT_ROOT before persisting private visual target artifacts'
    };
  }
  if(!currentRead.ok){
    return {
      attempted: false,
      changed: false,
      reason: `${manifestInfo.spec.key} is incomplete locally; refusing to persist missing or mismatched evidence`
    };
  }
  const source = abs(manifestInfo.privateRoot);
  const destination = path.join(destinationRoot, 'repo-mirror', manifestInfo.publicMetadataRoot);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true, force: true });
  return {
    attempted: true,
    changed: true,
    source: rel(source),
    destination,
    reason: `persisted ${manifestInfo.spec.key} private evidence to durable companion store`
  };
}

function nextActions(status){
  if(status.ok) return [];
  const actions = [];
  for(const artifact of status.artifacts){
    if(artifact.read.ok) continue;
    const completeSource = artifact.sourceCandidates.find(candidate => candidate.ok);
    if(completeSource){
      actions.push(`Run npm run machine:visual-targets:bootstrap to link ${artifact.key} from ${completeSource.artifactDir}.`);
    } else if(!artifact.read.manifestPresent){
      actions.push(`Regenerate or restore ${artifact.read.manifestPath}.`);
    } else {
      actions.push(`Set AURORA_PRIVATE_VISUAL_TARGET_ROOT, AURORA_PRIVATE_ARTIFACT_ROOT, or AURORA_PRIVATE_REPO_MIRROR_ROOT to a local source containing ${artifact.read.privateRoot}, then run npm run machine:visual-targets:bootstrap.`);
    }
  }
  return actions;
}

function privateVisualTargetArtifactStatus(options = {}){
  const persistRoot = options.persist ? persistDestinationRoot() : '';
  const artifacts = ARTIFACT_MANIFESTS.map(spec => {
    const manifestInfo = loadManifest(spec);
    let read = manifestRead(manifestInfo);
    const candidates = sourceCandidates(manifestInfo);
    const repair = options.repair ? repairManifest(manifestInfo, read, candidates) : null;
    if(repair?.changed){
      read = manifestRead(manifestInfo);
    }
    const persist = options.persist ? persistManifest(manifestInfo, read, persistRoot) : null;
    return {
      key: spec.key,
      label: spec.label,
      read,
      sourceCandidates: candidates,
      repair,
      persist
    };
  });
  const issues = [];
  for(const artifact of artifacts){
    if(!artifact.read.manifestPresent){
      issues.push(`${artifact.key} private-storage manifest is missing`);
    } else if(!artifact.read.ok){
      issues.push(`${artifact.key} private visual files are missing or mismatched`);
    }
    if(artifact.read.privateRoot && artifact.read.privateRootGitIgnored !== true){
      issues.push(`${artifact.key} private root is not covered by gitignore`);
    }
    if(options.persist && artifact.persist?.changed !== true){
      issues.push(`${artifact.key} private visual persistence was not completed: ${artifact.persist?.reason || 'unknown reason'}`);
    }
  }
  const status = {
    ok: issues.length === 0,
    artifactType: 'private-visual-target-artifact-status',
    generatedAt: new Date().toISOString(),
    root: ROOT,
    persistRoot: persistRoot || '',
    artifacts,
    summary: {
      artifactClassCount: artifacts.length,
      completeArtifactClassCount: artifacts.filter(artifact => artifact.read.ok).length,
      missingFileCount: artifacts.reduce((sum, artifact) => sum + artifact.read.missingCount, 0),
      mismatchedFileCount: artifacts.reduce((sum, artifact) => sum + artifact.read.mismatchedCount, 0)
    },
    issues
  };
  status.next = nextActions(status);
  return status;
}

module.exports = {
  ARTIFACT_MANIFESTS,
  privateVisualTargetArtifactStatus
};

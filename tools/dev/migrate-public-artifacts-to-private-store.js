#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const STORE_ROOT = path.join(ROOT, 'private-artifacts');
const STORE_MIRROR_ROOT = path.join(STORE_ROOT, 'repo-mirror');
const INIT_SCRIPT = path.join(ROOT, 'tools', 'dev', 'init-private-artifact-store.js');
const PUBLIC_SAFE_EXTS = new Set([
  '.md',
  '.json',
  '.sha256',
  '.txt',
  '.csv',
  '.tsv',
  '.yml',
  '.yaml'
]);
const DEFAULT_STATUS_REPLACEMENTS = [
  ['original-committed-and-source-manifested', 'public-metadata-private-content'],
  ['original-committed', 'preserved-private'],
  ['proxy-committed-original-external', 'proxy-preserved-private-original-external']
];

function normalizeRel(value=''){
  return String(value || '')
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .trim();
}

function rel(file){
  return normalizeRel(path.relative(ROOT, file));
}

function fromRoot(relativePath){
  return path.join(ROOT, normalizeRel(relativePath));
}

function fromStore(relativePath){
  return path.join(ROOT, 'private-artifacts', 'repo-mirror', normalizeRel(relativePath));
}

function ensurePrivateStore(){
  const result = spawnSync(process.execPath, [INIT_SCRIPT], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  if(result.status !== 0){
    throw new Error(result.stderr || result.stdout || 'Failed to initialize private artifact store.');
  }
}

function sha256(file){
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(file));
  return hash.digest('hex');
}

function listFiles(dir){
  const items = [];
  if(!fs.existsSync(dir)) return items;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for(const entry of entries){
    if(entry.name === '.DS_Store') continue;
    const full = path.join(dir, entry.name);
    if(entry.isDirectory()){
      items.push(...listFiles(full));
      continue;
    }
    if(entry.isFile()){
      items.push(full);
    }
  }
  return items;
}

function removeEmptyDirs(dir, stopAt){
  if(!fs.existsSync(dir)) return;
  const normalizedStop = path.resolve(stopAt);
  let current = path.resolve(dir);
  while(current.startsWith(normalizedStop) && current !== normalizedStop){
    if(fs.existsSync(current) && fs.readdirSync(current).length === 0){
      fs.rmdirSync(current);
      current = path.dirname(current);
      continue;
    }
    break;
  }
}

function isPublicSafeFile(file){
  const base = path.basename(file);
  if(base === 'README.md' || base === 'source-manifest.json' || base === 'checksums.sha256' || base === 'private-storage.json'){
    return true;
  }
  return PUBLIC_SAFE_EXTS.has(path.extname(file).toLowerCase());
}

function applyMappingToText(input, mappingEntries){
  let output = String(input || '');
  for(const [from, to] of mappingEntries){
    output = output.split(from).join(to);
  }
  for(const [from, to] of DEFAULT_STATUS_REPLACEMENTS){
    output = output.split(from).join(to);
  }
  return output;
}

function replaceStringsDeep(value, mappingEntries){
  if(typeof value === 'string'){
    return applyMappingToText(value, mappingEntries);
  }
  if(Array.isArray(value)){
    return value.map((entry) => replaceStringsDeep(entry, mappingEntries));
  }
  if(value && typeof value === 'object'){
    const next = {};
    for(const [key, child] of Object.entries(value)){
      next[key] = replaceStringsDeep(child, mappingEntries);
    }
    return next;
  }
  return value;
}

function insertBoundaryNote(readme, pointerPath, privateRootRel){
  const note = `
## Public/Private Boundary

This public repo now keeps only the metadata for this accession.

Copied or derived source bytes for this artifact family have been moved into the
companion private artifact store.

- public pointer: \`${pointerPath}\`
- private companion root: \`${privateRootRel}\`
`;
  if(readme.includes('## Public/Private Boundary')) return readme;
  return `${readme.replace(/\s+$/, '')}\n${note}`;
}

function collapseTargetDir(target){
  const normalized = normalizeRel(target);
  const parts = normalized.split('/').filter(Boolean);
  if(normalized.startsWith('reference-artifacts/preserved-sources/')){
    return parts.slice(0, Math.min(4, parts.length)).join('/');
  }
  if(normalized.startsWith('reference-artifacts/analyses/')){
    return parts.length >= 4 ? parts.slice(0, 4).join('/') : normalized;
  }
  return normalized;
}

function discoverUntrackedReferenceDirs(){
  const result = spawnSync('git', ['status', '--short', '--', 'reference-artifacts/analyses', 'reference-artifacts/preserved-sources'], {
    cwd: ROOT,
    encoding: 'utf8'
  });
  if(result.status !== 0){
    throw new Error(result.stderr || result.stdout || 'Failed to inspect untracked reference artifacts.');
  }
  const dirs = new Set();
  for(const line of result.stdout.split('\n')){
    if(!line.startsWith('?? ')) continue;
    const target = line.slice(3).trim();
    if(!target) continue;
    const full = fromRoot(target);
    const candidate = fs.existsSync(full) && fs.statSync(full).isDirectory()
      ? target
      : path.dirname(target);
    const collapsed = collapseTargetDir(candidate);
    if(!collapsed) continue;
    const abs = fromRoot(collapsed);
    if(fs.existsSync(abs) && fs.statSync(abs).isDirectory()){
      dirs.add(normalizeRel(collapsed));
    }
  }
  return Array.from(dirs).sort();
}

function parseArgs(argv){
  const paths = [];
  for(let index = 0; index < argv.length; index += 1){
    const token = argv[index];
    if(token === '--path'){
      const next = argv[index + 1];
      if(!next){
        throw new Error('Missing value after --path');
      }
      paths.push(normalizeRel(next));
      index += 1;
      continue;
    }
    if(token.startsWith('--')){
      throw new Error(`Unknown option: ${token}`);
    }
    paths.push(normalizeRel(token));
  }
  return {
    paths
  };
}

function writeJson(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function patchPublicMetadataFiles(targetDirRel, mappingEntries, movedFiles){
  const targetDir = fromRoot(targetDirRel);
  const privateRootRel = normalizeRel(path.join('private-artifacts', 'repo-mirror', targetDirRel));
  const pointerRel = normalizeRel(path.join(targetDirRel, 'private-storage.json'));
  const movedForDir = movedFiles.filter((entry) => entry.publicRepoPath.startsWith(`${targetDirRel}/`));
  const metadataFiles = listFiles(targetDir).filter((file) => isPublicSafeFile(file));
  for(const file of metadataFiles){
    const base = path.basename(file);
    if(base === 'private-storage.json') continue;
    if(path.extname(file).toLowerCase() === '.json'){
      const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
      let next = replaceStringsDeep(parsed, mappingEntries);
      if(base === 'source-manifest.json'){
        next.storage_policy = 'public-metadata-private-content';
        next.private_companion_store = {
          pointer_path: pointerRel,
          private_root: privateRootRel,
          moved_file_count: movedForDir.length
        };
        if(typeof next.status === 'string'){
          next.status = 'public-metadata-private-content';
        }
        const originalCommittedArtifacts = Array.isArray(parsed.committed_artifacts)
          ? parsed.committed_artifacts
          : [];
        if(Array.isArray(next.committed_artifacts)){
          next.committed_artifacts = next.committed_artifacts.map((item, index) => {
            const originalItem = originalCommittedArtifacts[index];
            if(!item || typeof item !== 'object' || !originalItem || !originalItem.repo_path) return item;
            const privatePath = mappingEntries.find(([from]) => from === originalItem.repo_path);
            if(!privatePath) return item;
            return {
              ...item,
              status: typeof item.status === 'string'
                ? applyMappingToText(item.status, mappingEntries)
                : 'preserved-private',
              public_repo_path: originalItem.repo_path,
              private_store_path: privatePath[1],
              repo_path: null
            };
          });
        }
      }
      writeJson(file, next);
      continue;
    }
    let text = fs.readFileSync(file, 'utf8');
    text = applyMappingToText(text, mappingEntries);
    if(base === 'README.md'){
      text = insertBoundaryNote(text, pointerRel, privateRootRel);
    }
    fs.writeFileSync(file, text);
  }

  const pointerFile = fromRoot(pointerRel);
  writeJson(pointerFile, {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    status: 'public-metadata-private-content',
    public_metadata_root: targetDirRel,
    private_root: privateRootRel,
    moved_file_count: movedForDir.length,
    moved_files: movedForDir
  });
}

function main(){
  const args = parseArgs(process.argv.slice(2));
  ensurePrivateStore();

  const targetDirs = (args.paths.length ? args.paths : discoverUntrackedReferenceDirs())
    .map((entry) => normalizeRel(entry))
    .filter(Boolean);
  if(!targetDirs.length){
    console.log(JSON.stringify({
      ok: true,
      migratedDirs: [],
      movedFileCount: 0,
      note: args.paths.length
        ? 'No explicit reference-artifact directories were provided to migrate.'
        : 'No untracked reference-artifact directories were found to migrate.'
    }, null, 2));
    return;
  }

  const movedFiles = [];
  for(const targetDirRel of targetDirs){
    const targetDir = fromRoot(targetDirRel);
    const files = listFiles(targetDir).filter((file) => !isPublicSafeFile(file));
    for(const file of files){
      const publicRepoPath = rel(file);
      const privateStorePath = normalizeRel(path.join('private-artifacts', 'repo-mirror', publicRepoPath));
      const dest = fromStore(publicRepoPath);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(file, dest);
      const stats = fs.statSync(file);
      fs.unlinkSync(file);
      movedFiles.push({
        publicRepoPath,
        privateStorePath,
        bytes: stats.size,
        sha256: sha256(dest)
      });
      removeEmptyDirs(path.dirname(file), targetDir);
    }
  }

  const mappingEntries = movedFiles
    .map((entry) => [entry.publicRepoPath, entry.privateStorePath])
    .sort((left, right) => right[0].length - left[0].length);

  for(const targetDirRel of targetDirs){
    patchPublicMetadataFiles(targetDirRel, mappingEntries, movedFiles);
  }

  console.log(JSON.stringify({
    ok: true,
    migratedDirs: targetDirs,
    movedFileCount: movedFiles.length,
    movedFiles
  }, null, 2));
}

main();

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const STORE_ROOT = path.join(ROOT, 'private-artifacts');
const MIRROR_ROOT = path.join(STORE_ROOT, 'repo-mirror');

function writeIfChanged(file, content){
  if(fs.existsSync(file)){
    const current = fs.readFileSync(file, 'utf8');
    if(current === content) return false;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  return true;
}

function runGit(args, cwd){
  return spawnSync('git', args, {
    cwd,
    encoding: 'utf8'
  });
}

function ensureGitRepo(dir){
  const gitDir = path.join(dir, '.git');
  if(fs.existsSync(gitDir)) return false;
  fs.mkdirSync(dir, { recursive: true });
  let result = runGit(['init', '-b', 'main'], dir);
  if(result.status === 0) return true;
  result = runGit(['init'], dir);
  if(result.status !== 0){
    throw new Error(`Failed to initialize private artifact store git repo:\n${result.stderr || result.stdout}`);
  }
  const checkout = runGit(['checkout', '-b', 'main'], dir);
  if(checkout.status !== 0){
    throw new Error(`Initialized git repo, but could not create main branch:\n${checkout.stderr || checkout.stdout}`);
  }
  return true;
}

function main(){
  fs.mkdirSync(MIRROR_ROOT, { recursive: true });
  const initializedGitRepo = ensureGitRepo(STORE_ROOT);
  const changedFiles = [];
  const readmeChanged = writeIfChanged(
    path.join(STORE_ROOT, 'README.md'),
    `# Codex-Test1 Private Artifact Store

This companion repository holds copied and derived artifact bytes that should
not live in the public \`sgwoods/Codex-Test1\` repository.

## Public / Private Split

The public repo keeps:

- readmes
- manifests
- checksums
- provenance notes
- summary JSON
- dashboard and planning documents

This private companion repo keeps:

- copied PDFs and HTML snapshots
- copied gameplay videos and audio files
- copied still-image and sprite bundles
- extracted clips
- contact sheets
- waveform renders
- other derived media bytes

The mirrored artifact tree lives under:

- \`repo-mirror/reference-artifacts/\`

That layout lets the public repo keep stable metadata paths while the private
store keeps the actual source and derivative bytes.
`
  );
  if(readmeChanged) changedFiles.push('README.md');

  const ignoreChanged = writeIfChanged(
    path.join(STORE_ROOT, '.gitignore'),
    `.DS_Store
Thumbs.db
`
  );
  if(ignoreChanged) changedFiles.push('.gitignore');

  const policyChanged = writeIfChanged(
    path.join(STORE_ROOT, 'STORE_POLICY.md'),
    `# Store Policy

This repository is the private companion artifact store for
\`/Users/steven/Projects-All/Codex-Test1\`.

Use it for copied and derived source bytes only.

Do not move public-safe metadata out of the public repo:

- README files
- manifests
- checksums
- source URLs
- summary JSON
- repo-owned plans and reports
`
  );
  if(policyChanged) changedFiles.push('STORE_POLICY.md');

  console.log(JSON.stringify({
    ok: true,
    storeRoot: STORE_ROOT,
    mirrorRoot: MIRROR_ROOT,
    initializedGitRepo,
    changedFiles
  }, null, 2));
}

main();

#!/usr/bin/env node
const assert = require('assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { writeDocumentationContract, checkDocumentationContract } = require('../build/release-documentation-contract');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'release-doc-contract-'));
const dir = path.join(root, 'dist');
const write = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, typeof value === 'string' ? value : JSON.stringify(value));
};
try{
  const note = { version: '1.4.2-beta.5', date: '2026-10-24', title: 'Beta', summary: 'Review', sourceDoc: 'NOTE.md' };
  for(const file of ['README.md', 'WHITE_PAPER.md', 'RELEASE_READINESS_REVIEW.md', 'RELEASE_VERSIONING.md', 'NOTE.md']) write(path.join(root, file), 'Current documentation');
  for(const file of ['package.json', 'release-manifest.json', 'release-dashboard.json', 'application-guide.json']) write(path.join(root, file), {});
  write(path.join(root, 'documentation-provenance.json'), { surfaces: [] });
  write(path.join(root, 'release-notes.json'), { notes: [note] });
  write(path.join(dir, 'release-notes.json'), { notes: [note] });
  const info = { commit: 'abc', version: note.version, releaseChannel: 'production beta', latestReleaseNote: note };
  write(path.join(dir, 'build-info.json'), info);
  for(const file of ['release-notes.html', 'releases.html']) write(path.join(dir, file), '<a href="NOTE.md">Beta</a>');
  writeDocumentationContract(root, dir);
  assert.equal(checkDocumentationContract(root, dir).version, note.version);
  write(path.join(root, 'README.md'), 'Changed after build');
  assert.throws(() => checkDocumentationContract(root, dir), /changed after build/);
  writeDocumentationContract(root, dir);
  assert.doesNotThrow(() => checkDocumentationContract(root, dir));
  write(path.join(dir, 'build-info.json'), { ...info, latestReleaseNote: { ...note, version: 'old' } });
  assert.throws(() => checkDocumentationContract(root, dir), /metadata/);
  write(path.join(dir, 'build-info.json'), { ...info, commit: 'other' });
  assert.throws(() => checkDocumentationContract(root, dir), /identity/);
  write(path.join(dir, 'build-info.json'), info);
  write(path.join(dir, 'release-notes.json'), { notes: [{ ...note, version: 'old' }] });
  assert.throws(() => checkDocumentationContract(root, dir), /exact lane/);
  write(path.join(dir, 'release-notes.json'), { notes: [note] });
  write(path.join(dir, 'releases.html'), 'Stale archive');
  assert.throws(() => checkDocumentationContract(root, dir), /missing/);
  console.log('PASS: release docs contract detects stale sources, wrong note, identity and missing rendered link');
}finally{
  fs.rmSync(root, { recursive: true, force: true });
}

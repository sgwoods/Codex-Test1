const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MANIFEST = 'assets/release-documentation-sources.json';
const SOURCES = [
  'package.json', 'release-manifest.json', 'release-notes.json',
  'release-dashboard.json', 'README.md', 'WHITE_PAPER.md',
  'RELEASE_READINESS_REVIEW.md', 'RELEASE_VERSIONING.md', 'application-guide.json',
  'documentation-provenance.json'
];
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));

function documentationSources(root){
  const notes = readJson(path.join(root, 'release-notes.json')).notes || [];
  const provenance = readJson(path.join(root, 'documentation-provenance.json'));
  const sources = new Set(SOURCES);
  for(const note of notes) if(note.sourceDoc) sources.add(note.sourceDoc);
  for(const surface of provenance.surfaces || []){
    for(const section of surface.sections || []){
      // Provenance also links archive directories; fingerprint the declared files.
      for(const source of section.sourceArtifacts || []){
        if(fs.statSync(path.join(root, source)).isFile()) sources.add(source);
      }
    }
  }
  return [...sources].sort().map(file => {
    const full = path.resolve(root, file);
    if(!full.startsWith(`${path.resolve(root)}${path.sep}`)) throw new Error('Documentation source escapes repository');
    return { file, sha256: digest(fs.readFileSync(full)) };
  });
}

function writeDocumentationContract(root, dir){
  const info = readJson(path.join(dir, 'build-info.json'));
  const output = path.join(dir, MANIFEST);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify({ schemaVersion: 1, commit: info.commit, sources: documentationSources(root) }, null, 2)}\n`);
}

function checkDocumentationContract(root, dir){
  const manifest = readJson(path.join(dir, MANIFEST));
  const info = readJson(path.join(dir, 'build-info.json'));
  if(manifest.schemaVersion !== 1 || manifest.commit !== info.commit) throw new Error('Documentation manifest build identity mismatch');
  if(JSON.stringify(manifest.sources) !== JSON.stringify(documentationSources(root))){
    throw new Error('Release documentation changed after build. Rebuild, re-promote and re-test before publication.');
  }
  const notes = readJson(path.join(dir, 'release-notes.json')).notes || [];
  const version = /beta|^production$/i.test(info.releaseChannel)
    ? info.version : `${info.versionLine}-dev`;
  const note = notes.find(row => row.version === version);
  if(!note || !note.sourceDoc || !note.title || !note.summary || !Number.isFinite(Date.parse(note.date))){
    throw new Error(`Missing complete release note for exact lane version ${version}`);
  }
  if(JSON.stringify(info.latestReleaseNote) !== JSON.stringify(note)) throw new Error('Build release-note metadata does not match exact lane note');
  for(const file of ['release-notes.html', 'releases.html']){
    const html = fs.readFileSync(path.join(dir, file), 'utf8');
    if(!html.includes(note.sourceDoc)) throw new Error(`${file} is missing the current release-note link`);
  }
  return { version, sourceCount: manifest.sources.length };
}

module.exports = { MANIFEST, documentationSources, writeDocumentationContract, checkDocumentationContract };

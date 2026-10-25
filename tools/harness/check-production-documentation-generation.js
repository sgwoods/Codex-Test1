const assert = require('assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { regenerateProductionDocumentation } = require('../build/build-index');
const { checkDocumentationContract } = require('../build/release-documentation-contract');
const root = path.resolve(__dirname, '../..');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'production-docs-'));
try {
  const beta = JSON.parse(fs.readFileSync(path.join(root, 'dist/beta/build-info.json')));
  const note = JSON.parse(fs.readFileSync(path.join(root, 'release-notes.json'))).notes.find(n => n.version === '1.4.2');
  const info = { ...beta, commit: 'frozen-runtime-fixture', version: '1.4.2', versionLine: '1.4.2', releaseChannel: 'production', latestReleaseNote: note,
    label: `1.4.2+build.${beta.buildNumber}.sha.${beta.shortCommit}`, promotedFromApprovedBeta: beta.label };
  fs.writeFileSync(path.join(dir, 'index.html'), 'FROZEN GAME SENTINEL');
  fs.writeFileSync(path.join(dir, 'build-info.json'), JSON.stringify(info));
  fs.writeFileSync(path.join(dir, 'white-paper.pdf'), 'OLD PDF');
  regenerateProductionDocumentation(dir, info);
  assert.equal(fs.readFileSync(path.join(dir, 'index.html'), 'utf8'), 'FROZEN GAME SENTINEL');
  assert.equal(fs.existsSync(path.join(dir, 'white-paper.pdf')), false);
  assert.equal(checkDocumentationContract(root, dir).version, '1.4.2');
  for(const file of ['releases.html', 'release-notes.html']){
    const html = fs.readFileSync(path.join(dir, file), 'utf8');
    assert(html.includes(note.title));
    assert(html.includes(note.sourceDoc));
    assert(!html.includes('undefined'));
  }
  const provenance = JSON.parse(fs.readFileSync(path.join(dir, 'assets/production-documentation-provenance.json')));
  assert.equal(provenance.runtimeCommit, info.commit);
  assert.equal(provenance.approvedBeta, beta.label);
  assert(fs.readFileSync(path.join(dir, 'releases.html'), 'utf8').includes(`/blob/${provenance.documentationCommit}/${note.sourceDoc}`));
  for(const file of ['releases.html', 'release-notes.html', 'public-project-page.html']){
    assert(!fs.readFileSync(path.join(dir, file), 'utf8').includes(`/blob/${info.commit}/${note.sourceDoc}`));
  }
  assert.throws(() => regenerateProductionDocumentation(dir, { ...info, latestReleaseNote: beta.latestReleaseNote }), /exact production/);
  console.log('PASS: production docs generated, exact notes and provenance, frozen game unchanged, stale PDF invalidated, wrong note rejected');
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}

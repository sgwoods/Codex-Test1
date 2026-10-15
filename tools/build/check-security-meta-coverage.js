#!/usr/bin/env node
const assert = require('assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { observeIssues } = require('./check-security-release-gate');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'aurora-meta-coverage-'));
const csp = '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'">';
const referrer = '<meta name="referrer" content="strict-origin-when-cross-origin">';
const write = (name, head) => fs.writeFileSync(path.join(root, name), `<!doctype html><html><head>${head}</head><body>Fixture</body></html>`);
const observation = () => observeIssues(root).get('SEC-004');
try{
  assert.equal(observation().observed, true, 'An empty package must not pass');
  write('index.html', csp + referrer);
  for(const name of ['releases.html', 'project-overview-slides.html']){
    write(name, referrer);
    assert.equal(observation().observed, true);
    assert.deepEqual(observation().details.missingCspFiles, [name]);
    write(name, csp);
    assert.deepEqual(observation().details.missingReferrerFiles, [name]);
    write(name, csp + referrer);
    assert.equal(observation().observed, false);
  }
  assert.equal(observation().details.checkedHtmlFiles.length, 3);
  console.log('PASS: each top-level HTML page requires both security meta policies');
}finally{
  fs.rmSync(root, { recursive: true, force: true });
}

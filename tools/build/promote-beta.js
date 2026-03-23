#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const BETA_DIR = path.join(ROOT, 'beta');
const FILES = [
  'index.html',
  'release-dashboard.html',
  'project-guide.html',
  'build-info.json',
  'release-notes.json',
  'export.mov.png',
  'README.md'
];

fs.mkdirSync(BETA_DIR, { recursive: true });

for(const file of FILES){
  const src = path.join(ROOT, file);
  if(!fs.existsSync(src)) continue;
  const dest = path.join(BETA_DIR, file === 'index.html' ? 'index.html' : path.basename(file));
  fs.copyFileSync(src, dest);
}

const betaReadme = [
  '# Aurora Galactica Beta',
  '',
  'This directory is the manually promoted beta lane.',
  'It is intentionally updated less often than the continuously published alpha build at the repository root.',
  '',
  'Promoted from the current built artifacts with `npm run promote:beta`.'
].join('\n') + '\n';

fs.writeFileSync(path.join(BETA_DIR, 'README.txt'), betaReadme);
console.log(`Promoted current build artifacts to ${BETA_DIR}`);

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const pkg = require(path.resolve(__dirname, '..', '..', 'package.json'));

const ROOT = path.resolve(__dirname, '..', '..');
const SRC = path.join(ROOT, 'src');
const SCRIPT_DIR = path.join(SRC, 'js');
const TEMPLATE = path.join(SRC, 'index.template.html');
const STYLES = path.join(SRC, 'styles.css');
const OUT = path.join(ROOT, 'index.html');

function read(file){
  return fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
}

function build(){
  const template = read(TEMPLATE);
  const styles = read(STYLES).trimEnd();
  const buildVersion = pkg.version;
  const buildReleaseEt = new Intl.DateTimeFormat('en-US',{
    timeZone:'America/New_York',
    year:'numeric',
    month:'short',
    day:'2-digit',
    hour:'numeric',
    minute:'2-digit',
    hour12:true,
    timeZoneName:'short'
  }).format(new Date()).replace(',', '');
  const script = fs.readdirSync(SCRIPT_DIR)
    .filter(file => file.endsWith('.js'))
    .sort()
    .map(file => `// Source: src/js/${file}\n${read(path.join(SCRIPT_DIR, file)).trimEnd()}`)
    .join('\n\n')
    .replaceAll('{{BUILD_VERSION}}', buildVersion)
    .replaceAll('{{BUILD_RELEASE_ET}}', buildReleaseEt)
    .trimEnd();

  const html = template
    .replace('{{INLINE_STYLES}}', `/* Generated from src/styles.css */\n${styles}`)
    .replace('{{INLINE_SCRIPT}}', `// Generated from src/js/*.js\n${script}`)
    .replaceAll('{{BUILD_VERSION}}', buildVersion)
    .replaceAll('{{BUILD_RELEASE_ET}}', buildReleaseEt);

  fs.writeFileSync(OUT, html.endsWith('\n') ? html : `${html}\n`);
  return OUT;
}

const out = build();
console.log(`Built ${out}`);

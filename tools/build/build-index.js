#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const SRC = path.join(ROOT, 'src');
const TEMPLATE = path.join(SRC, 'index.template.html');
const STYLES = path.join(SRC, 'styles.css');
const SCRIPT = path.join(SRC, 'game.js');
const OUT = path.join(ROOT, 'index.html');

function read(file){
  return fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
}

function build(){
  const template = read(TEMPLATE);
  const styles = read(STYLES).trimEnd();
  const script = read(SCRIPT).trimEnd();

  const html = template
    .replace('{{INLINE_STYLES}}', `/* Generated from src/styles.css */\n${styles}`)
    .replace('{{INLINE_SCRIPT}}', `// Generated from src/game.js\n${script}`);

  fs.writeFileSync(OUT, html.endsWith('\n') ? html : `${html}\n`);
  return OUT;
}

const out = build();
console.log(`Built ${out}`);

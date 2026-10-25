const fs = require('fs');
const path = require('path');

function assertComplete(text, label){
  // Strip presentation tags so a formatted editorial marker cannot evade review.
  const visible = text.replace(/<[^>]*>/g, '')
    .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (entity, code) => {
      const value = code[0].toLowerCase() === 'x'
        ? parseInt(code.slice(1), 16) : Number(code);
      return value <= 0x10ffff ? String.fromCodePoint(value) : entity;
    })
    .replace(/&(?:gt|lt|nbsp);/g, ' ');
  const marker = visible.match(/\b(?:TODO|TBD|FIXME)\b|\[\s*insert\s+[^\]]+\]/i);
  if(marker) throw new Error(`${label}: unfinished editorial marker ${marker[0]}`);
}

function checkWhitePaperSources(root){
  const guide = JSON.parse(fs.readFileSync(path.join(root, 'white-paper.json'), 'utf8'));
  assertComplete(JSON.stringify(guide), 'white-paper.json');
  for(const doc of guide.sourceDocs){
    assertComplete(fs.readFileSync(path.join(root, doc.file), 'utf8'), doc.file);
  }
}

module.exports = { assertComplete, checkWhitePaperSources };

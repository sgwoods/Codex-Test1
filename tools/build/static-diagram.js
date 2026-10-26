const crypto = require('crypto');
const path = require('path');
const { execFileSync } = require('child_process');

const cache = new Map();
function renderStaticDiagram(source){
  if(!cache.has(source)){
    const id = `diagram-${crypto.createHash('sha256').update(source).digest('hex').slice(0, 16)}`;
    const svg = execFileSync(process.execPath, [path.join(__dirname, 'render-static-diagram.js')], {
      input: JSON.stringify({ source, id }), encoding: 'utf8',
      timeout: 60000, maxBuffer: 5 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe']
    });
    if(!svg.startsWith('<svg')) throw new Error('Static diagram renderer returned no SVG.');
    cache.set(source, svg);
  }
  return cache.get(source);
}

module.exports = { renderStaticDiagram };

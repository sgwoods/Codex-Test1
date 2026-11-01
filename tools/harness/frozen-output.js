const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

function createFrozenOutput(bundle, output) {
  const root = fs.realpathSync(bundle);
  let ancestor = path.resolve(output), suffix = '';
  while (!fs.existsSync(ancestor)) {
    suffix = path.join(path.basename(ancestor), suffix);
    ancestor = path.dirname(ancestor);
  }
  const out = path.join(fs.realpathSync(ancestor), suffix);
  const relative = path.relative(root, out);
  assert(relative && (relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)),
    'Output must be outside frozen input');
  assert(!fs.existsSync(out), 'Output must be new');
  fs.mkdirSync(out, {recursive:true});
  return {root, out};
}

module.exports = {createFrozenOutput};

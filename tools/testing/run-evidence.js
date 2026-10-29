const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const ROOT = path.resolve(__dirname, '../..');
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

function inventory(root) {
  const files = [];
  function visit(relative) {
    const file = path.join(root, relative);
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink()) throw new Error(`Symlink is not a frozen input: ${file}`);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(file).sort()) visit(path.join(relative, name));
    } else if (stat.isFile()) {
      const bytes = fs.readFileSync(file);
      files.push({ file: relative.split(path.sep).join('/'), bytes: bytes.length, sha256: digest(bytes) });
    } else throw new Error(`Unsupported input type: ${file}`);
  }
  visit('');
  return { sha256: digest(JSON.stringify(files)), files };
}

function sourceIdentity(root = ROOT) {
  const git = args => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim();
  return { commit: git(['rev-parse', 'HEAD']), branch: git(['branch', '--show-current']),
    status: git(['status', '--short']), diffSha256: digest(git(['diff', 'HEAD', '--', '.'])) };
}

function newRun(kind, base = path.join(ROOT, 'harness-artifacts', 'test-runs')) {
  fs.mkdirSync(base, { recursive: true });
  return fs.mkdtempSync(path.join(base, `${kind}-${new Date().toISOString().replace(/[:.]/g, '-')}-`));
}
module.exports = { ROOT, digest, inventory, writeJson, sourceIdentity, newRun };

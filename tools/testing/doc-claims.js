const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function insideFile(root, file) {
  assert.equal(typeof file, 'string', 'Claim file must be a relative path');
  assert(file && !path.isAbsolute(file), 'Claim file must be a relative path');
  const base = fs.realpathSync(root);
  const full = fs.realpathSync(path.resolve(base, file));
  const relative = path.relative(base, full);
  assert(relative && relative !== '..' && !relative.startsWith(`..${path.sep}`), 'Claim file escapes repository');
  assert(fs.statSync(full).isFile(), `Claim is not a file: ${file}`);
  return full;
}

function readClaims(markdown) {
  // These fenced blocks are an explicit documentation contract, not inferred prose.
  const blocks = [...markdown.matchAll(/^```aurora-claims\r?\n([\s\S]*?)^```[ \t]*\r?$/gm)];
  assert(blocks.length, 'No executable documentation claims found');
  const starts = markdown.match(/^```aurora-claims\b/gm) || [];
  assert.equal(blocks.length, starts.length, 'Unclosed documentation claim block');
  const claims = blocks.flatMap(block => {
    const parsed = JSON.parse(block[1]);
    assert(Array.isArray(parsed) && parsed.length, 'Claim block must be a nonempty array');
    return parsed;
  });
  const ids = new Set();
  for (const claim of claims) {
    assert(claim && typeof claim === 'object' && !Array.isArray(claim), 'Invalid claim');
    assert(typeof claim.id === 'string' && claim.id && !ids.has(claim.id), 'Missing or duplicate claim id');
    ids.add(claim.id);
  }
  return claims;
}

function checkClaims(root, markdown) {
  const claims = readClaims(markdown);
  for (const claim of claims) {
    try {
      const keys = {
        file: ['id', 'kind', 'file'],
        command: ['id', 'kind', 'name', 'equals'],
        'json-value': ['id', 'kind', 'file', 'pointer', 'equals'],
        'json-length': ['id', 'kind', 'file', 'pointer', 'equals'],
      }[claim.kind];
      assert(keys, `Unknown claim kind: ${claim.kind}`);
      assert.deepEqual(Object.keys(claim).sort(), [...keys].sort(), 'Unexpected or missing claim field');
      if (claim.kind === 'file') insideFile(root, claim.file);
      else if (claim.kind === 'command') {
        const pkg = JSON.parse(fs.readFileSync(insideFile(root, 'package.json'), 'utf8'));
        assert(typeof claim.name === 'string' && Object.hasOwn(pkg.scripts || {}, claim.name), 'Documented command missing');
        assert(typeof claim.equals === 'string' && claim.equals.length, 'Command expectation must be nonempty');
        assert.equal(pkg.scripts[claim.name], claim.equals, 'Documented command changed');
      } else {
        assert(typeof claim.pointer === 'string' && claim.pointer.startsWith('/'), 'Expected JSON pointer');
        let value = JSON.parse(fs.readFileSync(insideFile(root, claim.file), 'utf8'));
        for (const token of claim.pointer.slice(1).split('/')) {
          assert(!/~(?![01])/u.test(token), 'Invalid JSON pointer escape');
          const key = token.replace(/~1/g, '/').replace(/~0/g, '~');
          if (Array.isArray(value)) assert(/^(0|[1-9][0-9]*)$/.test(key), 'Array JSON pointer requires an index');
          assert(value !== null && typeof value === 'object' && Object.hasOwn(value, key), `Missing JSON value: ${claim.pointer}`);
          value = value[key];
        }
        if (claim.kind === 'json-length') {
          assert(Array.isArray(value), 'Length claim requires a JSON array');
          assert(Number.isInteger(claim.equals) && claim.equals >= 0, 'Length expectation must be nonnegative');
          value = value.length;
        }
        assert.deepEqual(value, claim.equals, 'Documented JSON value changed');
      }
    } catch (error) {
      throw new Error(`${claim.id}: ${error.message}`, { cause: error });
    }
  }
  return { ok: true, checked: claims.length, ids: claims.map(claim => claim.id) };
}

if (require.main === module) {
  const root = path.resolve(__dirname, '../..');
  try {
    console.log(JSON.stringify(checkClaims(root, fs.readFileSync(path.join(root, 'TEST_MAP.md'), 'utf8')), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { insideFile, readClaims, checkClaims };

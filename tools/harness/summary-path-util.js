const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

function normalizeSlashes(value){
  return String(value || '').replace(/\\/g, '/');
}

function isWithin(parent, child){
  const rel = path.relative(parent, child);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function looksLikePath(value){
  return typeof value === 'string'
    && !!value
    && (path.isAbsolute(value)
      || value.startsWith('./')
      || value.startsWith('../')
      || value.startsWith('external:')
      || /^[A-Za-z]:[\\/]/.test(value));
}

function existingRepoSuffix(raw){
  const parts = normalizeSlashes(raw).split('/').filter(Boolean);
  for(let i=0;i<parts.length;i++){
    const suffix = parts.slice(i).join(path.sep);
    const candidate = path.join(ROOT, suffix);
    if(fs.existsSync(candidate)) return normalizeSlashes(path.relative(ROOT, candidate) || '.');
  }
  return null;
}

function portablePath(value, opts={}){
  if(typeof value !== 'string' || !value) return value;
  const runDir = opts.runDir ? path.resolve(opts.runDir) : null;
  const raw = value;

  if(raw.startsWith('external:')){
    const label = raw.slice('external:'.length);
    if(runDir){
      const localSibling = path.join(runDir, path.basename(label));
      if(fs.existsSync(localSibling)) return normalizeSlashes(path.basename(label));
    }
    return raw;
  }

  if(path.isAbsolute(raw)){
    if(runDir && isWithin(runDir, raw)){
      return normalizeSlashes(path.relative(runDir, raw) || '.');
    }
    if(isWithin(ROOT, raw)){
      return normalizeSlashes(path.relative(ROOT, raw) || '.');
    }
    const suffix = existingRepoSuffix(raw);
    if(suffix){
      if(runDir){
        const candidate = path.join(ROOT, suffix);
        if(isWithin(runDir, candidate)) return normalizeSlashes(path.relative(runDir, candidate) || '.');
      }
      return suffix;
    }
    return `external:${path.basename(raw)}`;
  }

  return normalizeSlashes(raw.replace(/^\.\//, ''));
}

function shouldNormalizeString(key, value){
  if(!looksLikePath(value)) return false;
  return key === 'source'
    || key === 'outDir'
    || key === 'file'
    || key === 'sourceFile'
    || key === 'sessionFile'
    || key === 'videoFile'
    || key === 'reportFile'
    || key === 'path';
}

function sanitizeValue(value, key, runDir){
  if(Array.isArray(value)){
    if(key === 'files') return value.map(item => portablePath(item, { runDir }));
    return value.map(item => sanitizeValue(item, null, runDir));
  }
  if(value && typeof value === 'object'){
    const out = {};
    for(const [childKey, childValue] of Object.entries(value)){
      out[childKey] = sanitizeValue(childValue, childKey, runDir);
    }
    return out;
  }
  if(typeof value === 'string' && shouldNormalizeString(key, value)){
    return portablePath(value, { runDir });
  }
  return value;
}

function sanitizeSummary(summary, runDir){
  return sanitizeValue(summary, null, runDir);
}

function writePortableSummary(file, summary){
  const runDir = path.dirname(path.resolve(file));
  const cleaned = sanitizeSummary(summary, runDir);
  fs.writeFileSync(file, JSON.stringify(cleaned, null, 2));
  return cleaned;
}

function findAbsoluteSummaryPaths(summary){
  const findings = [];

  function visit(value, trail){
    if(Array.isArray(value)){
      value.forEach((item, idx) => visit(item, `${trail}[${idx}]`));
      return;
    }
    if(value && typeof value === 'object'){
      for(const [key, child] of Object.entries(value)){
        visit(child, trail ? `${trail}.${key}` : key);
      }
      return;
    }
    if(typeof value === 'string' && looksLikePath(value) && path.isAbsolute(value)){
      findings.push({ field: trail || '(root)', value });
    }
  }

  visit(summary, '');
  return findings;
}

module.exports = {
  ROOT,
  findAbsoluteSummaryPaths,
  portablePath,
  sanitizeSummary,
  writePortableSummary
};

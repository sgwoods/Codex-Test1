const fs = require('fs');
const path = require('path');

const VERSION = /\b\d+\.\d+\.\d+(?:\.\d+)?(?:-[0-9A-Za-z]+(?:\.[0-9A-Za-z]+)*)?\b/g;
const CURRENT_CUE = /\b(?:as of this (?:draft|revision|release)|current(?:ly)?|now|remains?|today|latest)\b/i;
const DATE = /\b20\d\d-\d\d-\d\d\b|\b(?:January|February|March|April|May|June|July|August|September|October|November|December) 20\d\d\b/;

function canonicalReleaseVersions(root){
  const version = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version;
  return [version, version.replace(/-.*$/, '')];
}

// Claim units are paragraphs, list blocks joined to a lead-in ending in ':',
// and individual table rows.
function claimUnits(markdown){
  const units = [];
  let leadIn = '';
  for(const block of markdown.split(/\n\s*\n/)){
    if(block.trim().startsWith('|')){
      units.push(...block.split('\n'));
      leadIn = '';
      continue;
    }
    const unit = leadIn ? `${leadIn}\n${block}` : block;
    if(/:\s*$/.test(block)){
      leadIn = unit;
      continue;
    }
    units.push(unit);
    leadIn = '';
  }
  if(leadIn) units.push(leadIn);
  return units;
}

// A present-tense release claim must name a canonical version, or carry an
// explicit dated historical scope such as "June 2026 historical assessment".
function assertReleaseConsistent(markdown, label, canonical){
  for(const unit of claimUnits(markdown)){
    if(!CURRENT_CUE.test(unit)) continue;
    const stale = (unit.match(VERSION) || []).filter((v) => !canonical.includes(v));
    if(!stale.length) continue;
    if(/\bhistorical\b/i.test(unit) && DATE.test(unit)) continue;
    throw new Error(`${label}: current-tense release claim names ${stale.join(', ')} `
      + `but canonical release is ${canonical.join(' / ')}; add a dated historical scope or update it: `
      + JSON.stringify(unit.trim().slice(0, 160)));
  }
}

function checkWhitePaperReleaseConsistency(root){
  const canonical = canonicalReleaseVersions(root);
  const guide = JSON.parse(fs.readFileSync(path.join(root, 'white-paper.json'), 'utf8'));
  for(const doc of guide.sourceDocs){
    assertReleaseConsistent(fs.readFileSync(path.join(root, doc.file), 'utf8'), doc.file, canonical);
  }
}

module.exports = { assertReleaseConsistent, canonicalReleaseVersions, checkWhitePaperReleaseConsistency };

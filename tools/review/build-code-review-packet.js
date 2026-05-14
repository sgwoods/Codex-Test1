#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_ROOT = path.join(ROOT, 'reference-artifacts', 'analyses', 'code-review');
const EXCLUDED_PREFIXES = Object.freeze([
  'reference-artifacts/analyses/code-review/',
  'reference-artifacts/analyses/review-learning/'
]);

function git(args, fallback = ''){
  try{
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  }catch{
    return fallback;
  }
}

function argValue(name){
  const flag = `--${name}`;
  const index = process.argv.indexOf(flag);
  if(index >= 0) return process.argv[index + 1] || '';
  const prefix = `${flag}=`;
  const found = process.argv.find(arg => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : '';
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function resolveBase(){
  const explicit = argValue('base');
  if(explicit) return explicit;
  if(git(['rev-parse', '--verify', 'origin/main^{commit}'])) return 'origin/main';
  return 'HEAD~1';
}

function mergeBase(base){
  const resolved = git(['merge-base', 'HEAD', base]);
  return resolved || git(['rev-parse', 'HEAD']);
}

function nameStatus(baseCommit){
  const lines = git(['diff', '--name-status', `${baseCommit}..HEAD`]).split('\n').filter(Boolean);
  return lines.map(line => {
    const parts = line.split('\t');
    const status = parts[0] || '';
    const file = parts[parts.length - 1] || '';
    return { status, file };
  }).filter(row => row.file);
}

function statusRows(){
  return git(['status', '--short']).split('\n').filter(Boolean).map(line => ({
    raw: line,
    status: line.slice(0, 2).trim() || 'dirty',
    file: line.slice(2).trim()
  })).filter(row => row.file);
}

function uniqueRows(baseRows, dirtyRows){
  const byFile = new Map();
  for(const row of baseRows) byFile.set(row.file, { status: row.status, file: row.file, source: 'committed-range' });
  for(const row of dirtyRows){
    if(!byFile.has(row.file)) byFile.set(row.file, { status: row.status, file: row.file, source: 'working-tree' });
  }
  return [...byFile.values()]
    .filter(row => !EXCLUDED_PREFIXES.some(prefix => row.file.startsWith(prefix)))
    .sort((a, b) => a.file.localeCompare(b.file));
}

function classify(file){
  const tags = [];
  let area = 'docs-artifact';
  const lower = file.toLowerCase();
  if(file.startsWith('src/js/')){
    area = 'runtime';
    tags.push('browser-runtime');
  }
  if(file.startsWith('tools/build/') || file === 'package.json' || file.includes('release') || file.includes('publish')){
    area = 'release-tooling';
    tags.push('release-lane');
  }
  if(file.startsWith('tools/harness/') || file.startsWith('tools/review/')){
    area = area === 'docs-artifact' ? 'harness-tooling' : area;
    tags.push('harness');
  }
  if(file.includes('13-game-pack-registry') || file.includes('13-gameplay-adapter-registry') || file.includes('15-game-picker') || file.includes('19-render-shell') || file.includes('20-render') || file.includes('90-harness')){
    tags.push('platform-boundary');
  }
  if(file.match(/src\/js\/(00|01|02|03|04|12)-/) || file.includes('platform') || file.includes('auth') || file.includes('leaderboard')){
    tags.push('platform-owned');
  }
  if(file.match(/src\/js\/(05|06|07|08|09|10|13-aurora|13-galaxy|21-render-board|22-galaxy)/)){
    tags.push('game-owned');
  }
  if(lower.includes('auth') || lower.includes('session') || lower.includes('supabase') || lower.includes('password')){
    tags.push('auth-privacy');
  }
  if(lower.includes('score') || lower.includes('leaderboard') || lower.includes('trophy')){
    tags.push('score-trust');
  }
  if(lower.includes('youtube') || lower.includes('music.youtube') || lower.includes('playlist') || lower.includes('video') || lower.includes('replay')){
    tags.push('media-external');
  }
  if(lower.endsWith('.html') || lower.endsWith('.js') || lower.endsWith('.css')){
    tags.push('browser-safety');
  }
  return { area, riskTags: [...new Set(tags)].sort() };
}

function addedDiffLines(baseCommit){
  const committed = git(['diff', '--unified=0', `${baseCommit}..HEAD`]);
  const dirty = git(['diff', '--unified=0']);
  const text = [committed, dirty].filter(Boolean).join('\n');
  const rows = [];
  let file = '';
  for(const line of text.split('\n')){
    if(line.startsWith('+++ b/')){
      file = line.slice(6);
    }else if(line.startsWith('+') && !line.startsWith('+++')){
      rows.push({ file, text: line.slice(1) });
    }
  }
  return rows;
}

function finding(severity, id, message, file, evidence = ''){
  return { severity, id, message, file, evidence };
}

function automaticFindings(files, diffLines){
  const findings = [];
  const fileSet = new Set(files.map(row => row.file));
  for(const { file, text } of diffLines){
    const trimmed = text.trim();
    if(!trimmed) continue;
    if(/\b(eval\s*\(|new Function\s*\()/.test(trimmed)){
      findings.push(finding('P1', 'dynamic-code-execution', 'Dynamic code execution is not acceptable in the browser product without an explicit, reviewed sandbox.', file, trimmed));
    }
    if(/(service[_-]?role|SUPABASE_SERVICE_ROLE|sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9_]{20,})/.test(trimmed)){
      findings.push(finding('P1', 'secret-like-token', 'Secret-looking token or service-role reference added to source.', file, trimmed));
    }
    if(/localStorage\.[^(]*(password|token|secret|session)/i.test(trimmed) || /localStorage\.setItem\([^)]*(password|token|secret|session)/i.test(trimmed)){
      findings.push(finding('P1', 'sensitive-local-storage', 'Sensitive auth/session material appears to be written to localStorage.', file, trimmed));
    }
    if(/\b(innerHTML|outerHTML|insertAdjacentHTML)\b/.test(trimmed)){
      findings.push(finding('P2', 'html-injection-surface', 'HTML injection surface changed; verify content is static or sanitized.', file, trimmed));
    }
    if(/\bwindow\.open\s*\(/.test(trimmed) || /target=["']_blank["']/.test(trimmed)){
      findings.push(finding('P2', 'external-window-surface', 'External window/tab behavior changed; verify noopener, user intent, and lane policy.', file, trimmed));
    }
    if(/\bfetch\s*\(\s*['"]https?:\/\//.test(trimmed)){
      findings.push(finding('P2', 'external-fetch-surface', 'Direct external fetch added; verify privacy, failure behavior, and CORS assumptions.', file, trimmed));
    }
  }
  if([...fileSet].some(file => file.startsWith('src/js/13-game-pack-registry') || file.startsWith('src/js/13-gameplay-adapter-registry'))){
    findings.push(finding('P2', 'platform-game-boundary-review', 'Gameplay or pack registry changed; run platform/game boundary harnesses and review pack ownership.', 'src/js/13-gameplay-adapter-registry.js'));
  }
  if([...fileSet].some(file => file === 'package.json' || file.startsWith('tools/build/'))){
    findings.push(finding('P2', 'release-tooling-review', 'Release or npm script surface changed; verify lane authority and publish behavior.', 'package.json'));
  }
  return findings;
}

function recommendedChecks(files){
  const checks = new Set(['npm run build']);
  const names = files.map(row => row.file).join('\n');
  if(/src\/js\/13-game(pack|play)|src\/js\/15-game-picker|src\/js\/20-render|src\/js\/22-galaxy/.test(names)){
    checks.add('npm run harness:check:gameplay-adapter-boundaries');
    checks.add('npm run harness:check:pack-registry-boundaries');
    checks.add('npm run harness:check:platinum-renderer-boundaries');
    checks.add('npm run harness:check:platinum-pack-boot');
  }
  if(/auth|session|supabase|leaderboard|score|trophy/i.test(names)){
    checks.add('npm run harness:check:supabase-data-api-contract');
    checks.add('npm run harness:check:remote-score-submit');
    checks.add('npm run harness:check:signed-in-game-over-lock');
  }
  if(/audio|music|youtube|video|replay/i.test(names)){
    checks.add('npm run harness:check:audio-runtime-recovery');
    checks.add('npm run harness:check:trophy-replay-surface');
  }
  if(/tools\/build|package\.json|release|publish/i.test(names)){
    checks.add('npm run publish:check:dev');
  }
  checks.add('npm run review:code:check');
  return [...checks];
}

function markdown(report){
  const lines = [
    '# Code Review Packet',
    '',
    `Generated: \`${report.generatedAt}\``,
    '',
    `Branch: \`${report.branch}\``,
    `Base: \`${report.baseRef}\` / \`${report.baseCommit}\``,
    `Head: \`${report.headCommit}\``,
    '',
    '## Summary',
    '',
    `- changed files: \`${report.summary.changedFileCount}\``,
    `- automatic findings: P0 \`${report.summary.p0}\`, P1 \`${report.summary.p1}\`, P2 \`${report.summary.p2}\`, P3 \`${report.summary.p3}\``,
    `- dirty at packet time: \`${report.dirty}\``,
    '',
    '## Architecture Skill Read',
    '',
    `- installed architect skill found: \`${report.architecture.installedArchitectSkillFound}\``,
    `- repo-owned review skill: \`${report.reviewSkill.path}\``,
    `- model doc: \`${report.reviewSkill.modelDoc}\``,
    '',
    '## Recommended Checks',
    '',
    ...report.recommendedChecks.map(item => `- \`${item}\``),
    '',
    '## Automatic Findings',
    ''
  ];
  if(report.automaticFindings.length){
    for(const item of report.automaticFindings){
      lines.push(`- **${item.severity} ${item.id}** ${item.file}: ${item.message}`);
    }
  }else{
    lines.push('- No automatic findings.');
  }
  lines.push('', '## Changed Files', '');
  for(const file of report.changedFiles){
    lines.push(`- \`${file.file}\` (${file.status}; ${file.area}; ${file.riskTags.join(', ') || 'no-risk-tags'})`);
  }
  return `${lines.join('\n')}\n`;
}

function main(){
  const generatedAt = new Date().toISOString();
  const date = generatedAt.slice(0, 10);
  const branch = git(['branch', '--show-current'], 'unknown');
  const headCommit = git(['rev-parse', '--short', 'HEAD'], 'unknown');
  const baseRef = resolveBase();
  const baseCommit = mergeBase(baseRef);
  const dirtyRows = statusRows();
  const changedFiles = uniqueRows(nameStatus(baseCommit), dirtyRows).map(row => ({
    ...row,
    ...classify(row.file)
  }));
  const diffLines = addedDiffLines(baseCommit);
  const findings = automaticFindings(changedFiles, diffLines);
  const count = severity => findings.filter(item => item.severity === severity).length;
  const outDir = path.join(OUT_ROOT, `${date}-${headCommit}`);
  ensureDir(outDir);
  const report = {
    schemaVersion: 1,
    artifactType: 'platinum-code-review-packet',
    generatedAt,
    branch,
    baseRef,
    baseCommit,
    headCommit,
    dirty: dirtyRows.length > 0,
    statusShort: dirtyRows.map(row => row.raw),
    reviewSkill: {
      path: 'codex-skills/platinum-code-review/SKILL.md',
      modelDoc: 'CODE_REVIEW_MODEL.md'
    },
    architecture: {
      installedArchitectSkillFound: false,
      repoArchitectureDocs: [
        'ARCHITECTURE.md',
        'PLATINUM_ARCHITECTURE_OVERVIEW.md',
        'APPLICATIONS_ON_PLATINUM.md',
        'PLATINUM_GAME_BOUNDARY_AUDIT.md'
      ],
      boundaryHarnesses: [
        'npm run harness:check:gameplay-adapter-boundaries',
        'npm run harness:check:pack-registry-boundaries',
        'npm run harness:check:platinum-renderer-boundaries',
        'npm run harness:check:platinum-pack-boot'
      ]
    },
    summary: {
      changedFileCount: changedFiles.length,
      p0: count('P0'),
      p1: count('P1'),
      p2: count('P2'),
      p3: count('P3'),
      riskTaggedFileCount: changedFiles.filter(file => file.riskTags.length).length
    },
    changedFiles,
    automaticFindings: findings,
    recommendedChecks: recommendedChecks(changedFiles)
  };
  const reportPath = path.join(outDir, 'report.json');
  const readmePath = path.join(outDir, 'README.md');
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(readmePath, markdown(report));
  fs.writeFileSync(path.join(OUT_ROOT, 'latest.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({
    ok: true,
    report: rel(reportPath),
    latest: rel(path.join(OUT_ROOT, 'latest.json')),
    summary: report.summary,
    recommendedChecks: report.recommendedChecks
  }, null, 2));
}

main();

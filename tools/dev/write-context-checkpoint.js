#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const MARKDOWN = path.join(ROOT, 'CODEX_CONTEXT_CHECKPOINT.md');
const JSON_OUT = path.join(ROOT, 'reference-artifacts', 'analyses', 'codex-context-checkpoint', 'latest.json');
const SELF_PATHS = new Set([
  'CODEX_CONTEXT_CHECKPOINT.md',
  'reference-artifacts/analyses/codex-context-checkpoint/latest.json'
]);

function parseArgs(argv){
  const args = { plan: [], next: [], note: [] };
  for(let i = 0; i < argv.length; i += 1){
    const raw = argv[i];
    if(!raw.startsWith('--')) continue;
    const eq = raw.indexOf('=');
    let key = '';
    let value = '';
    if(eq >= 0){
      key = raw.slice(2, eq);
      value = raw.slice(eq + 1);
    }else{
      key = raw.slice(2);
      const next = argv[i + 1];
      if(next && !next.startsWith('--')){
        value = next;
        i += 1;
      }else{
        value = 'true';
      }
    }
    if(key === 'plan' || key === 'next' || key === 'note') args[key].push(value);
    else args[key] = value;
  }
  return args;
}

function git(args, fallback = ''){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  }catch{
    return fallback;
  }
}

function command(cmd, args, fallback = ''){
  try{
    return execFileSync(cmd, args, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  }catch{
    return fallback;
  }
}

function filterSelfStatus(statusText){
  return String(statusText || '')
    .split(/\r?\n/)
    .filter(Boolean)
    .filter(line => {
      const file = /^.. /.test(line)
        ? line.slice(3).trim()
        : line.replace(/^[ MADRCU?!]{1,2}\s+/, '').trim();
      return !SELF_PATHS.has(file);
    });
}

function list(items, fallback){
  const clean = items.map(item => String(item || '').trim()).filter(Boolean);
  return clean.length ? clean : fallback;
}

function rel(file){
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function writeJson(file, value){
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function mdList(items){
  return items.map(item => `- ${item}`).join('\n');
}

function fenced(value, language = ''){
  return `\`\`\`${language}\n${String(value || '').trim() || '(none)'}\n\`\`\``;
}

function main(){
  const args = parseArgs(process.argv.slice(2));
  const generatedAt = new Date().toISOString();
  const label = String(args.label || 'manual-context-checkpoint');
  const branch = git(['branch', '--show-current'], 'unknown');
  const commit = git(['rev-parse', '--short', 'HEAD'], 'unknown');
  const commitSubject = git(['show', '-s', '--format=%s', 'HEAD'], '');
  const statusLines = filterSelfStatus(git(['status', '--short'], ''));
  const diffStat = git(['diff', '--stat'], '');
  const recentLog = git(['log', '-8', '--oneline', '--decorate'], '');
  const root = ROOT;
  const machineStatus = command('node', ['tools/dev/machine-status.js'], '');

  const plan = list(args.plan, [
    'Stabilize the active worktree before more conformance development.',
    'Preserve challenge-stage set-piece contracts, gameplay segment capture, and documentation links as durable project artifacts.',
    'Run focused harness checks and build, then commit and push the branch for clean handoff.'
  ]);
  const next = list(args.next, [
    'Start any resumed session by reading CODEX_CONTEXT_CHECKPOINT.md, RESTART_FROM_HERE.md, and MULTI_MACHINE_WORKFLOW.md.',
    'Run git branch --show-current, git status --short, and git log -5 --oneline --decorate before making assumptions.',
    'If the branch is dirty, inspect the intended files first and avoid broad staging of unrelated generated artifacts.',
    'After a coherent phase, rerun npm run codex:checkpoint and start a fresh session from the generated prompt before context becomes fragile.'
  ]);
  const notes = list(args.note, [
    'Codex Desktop does not expose a repo command that forces internal chat compaction. The safe replacement is a manual checkpoint plus a deliberate fresh session from this file.',
    'This checkpoint intentionally filters its own generated files out of the dirty-status read so it can be committed as the recovery point.'
  ]);

  const prompt = `You are continuing Aurora Galactica / Platinum work from a durable Codex checkpoint.

Repo path:
${root}

Start by running:
git branch --show-current
git status --short
git log -5 --oneline --decorate
npm run machine:status

Read first:
- CODEX_CONTEXT_CHECKPOINT.md
- RESTART_FROM_HERE.md
- MULTI_MACHINE_WORKFLOW.md

Current checkpoint:
- label: ${label}
- generated: ${generatedAt}
- branch: ${branch}
- commit: ${commit} ${commitSubject}
- dirty files excluding checkpoint self-output: ${statusLines.length}

Continue the active plan from the checkpoint. Preserve user work, do not publish beta/production unless this machine has release authority, and commit coherent progress before switching machines or long-running sessions.`;

  const payload = {
    ok: true,
    artifactType: 'codex-context-checkpoint',
    generatedAt,
    label,
    root,
    branch,
    commit,
    commitSubject,
    dirtyFileCountExcludingCheckpoint: statusLines.length,
    statusLinesExcludingCheckpoint: statusLines,
    diffStat,
    recentLog,
    machineStatus: machineStatus ? JSON.parse(machineStatus) : null,
    plan,
    next,
    notes,
    restartPrompt: prompt,
    files: {
      markdown: rel(MARKDOWN),
      json: rel(JSON_OUT)
    }
  };

  writeJson(JSON_OUT, payload);
  fs.writeFileSync(MARKDOWN, `# Codex Context Checkpoint

Generated: ${generatedAt}
Label: ${label}

This is the durable recovery point for long Aurora / Platinum Codex sessions.
Use it before switching machines, before starting a multi-hour run, and whenever
the conversation has become long enough that automatic compaction could drop
important working context.

## Current Repo State

- Repo path: \`${root}\`
- Branch: \`${branch}\`
- HEAD: \`${commit}\` ${commitSubject}
- Dirty files excluding checkpoint self-output: \`${statusLines.length}\`

## Active Plan

${mdList(plan)}

## Recommended Next Steps

${mdList(next)}

## Notes

${mdList(notes)}

## Git Status

${fenced(statusLines.join('\n'))}

## Diff Stat

${fenced(diffStat)}

## Recent Log

${fenced(recentLog)}

## Machine Status Snapshot

${fenced(machineStatus, 'json')}

## Exact Restart Prompt

${fenced(prompt, 'text')}

## Compaction Prevention Protocol

1. At every phase boundary, run:

${fenced('npm run codex:checkpoint -- --label <short-topic> --plan "<current goal>" --next "<next concrete step>"', 'bash')}

2. Commit the checkpoint if it records meaningful state or handoff context.
3. Start a fresh Codex session with the restart prompt above when the chat is
   long, after a multi-hour cycle, or before switching machines.
4. Treat the fresh session as the practical way to force compaction safely:
   context is rebuilt from the repo instead of relying on a fragile chat tail.

JSON artifact: \`${rel(JSON_OUT)}\`
`);

  console.log(JSON.stringify({
    ok: true,
    markdown: rel(MARKDOWN),
    json: rel(JSON_OUT),
    dirtyFileCountExcludingCheckpoint: statusLines.length,
    branch,
    commit
  }, null, 2));
}

try{
  main();
}catch(err){
  console.error(err && err.stack ? err.stack : String(err));
  process.exit(1);
}

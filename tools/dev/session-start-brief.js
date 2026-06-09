#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { gatherMachineSnapshot } = require('./machine-report');
const { ROOT, parseArgs } = require('./machine-common');

const DOCS = [
  'IMAC_GUARDIANS_ROLE_PROMPT_2026-06-03.md',
  'OTHER_MACHINE_CONTINUATION_HANDOFF_2026-06-03.md',
  'NEXT_CODEX_ACCOUNT_HANDOFF.md',
  'GUARDIANS_WATCH_AND_RIVAL_ENABLEMENT_PLAN_2026-06-07.md',
  'GUARDIANS_NEXT_20_PRIORITY_PLAN_2026-06-07.md',
  'RELEASE_LANE_MODEL.md'
];

function readDocTitle(relPath){
  const file = path.join(ROOT, relPath);
  if(!fs.existsSync(file)) return { relPath, title: 'Missing' };
  const text = fs.readFileSync(file, 'utf8');
  const titleLine = text.split('\n').find((line) => /^#\s+/.test(line.trim()));
  return {
    relPath,
    title: titleLine ? titleLine.replace(/^#\s+/, '').trim() : relPath
  };
}

function gitLine(args){
  try{
    return execFileSync('git', ['-C', ROOT, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  }catch{
    return '';
  }
}

function localServiceSummary(service, fallbackLabel){
  if(!service) return `${fallbackLabel}: unknown`;
  const state = service.ok ? 'running' : (service.reachable ? 'reachable but mismatched' : 'not running');
  return `${fallbackLabel}: ${state} (${service.url})`;
}

function laneSummary(name, lane){
  if(!lane || !lane.ok) return `${name}: unavailable`;
  return `${name}: ${lane.label} @ ${lane.commit}`;
}

function generalState(snapshot){
  const lines = [];
  const authority = snapshot.release_authority;
  const authorityLabel = authority ? authority.machine_label : 'unknown';
  const currentRole = authority && !authority.current_machine_matches
    ? 'This machine is currently a non-release iMac and should stay off hosted publish duties.'
    : 'This machine currently matches release authority.';
  lines.push(currentRole);
  lines.push(`Release authority is ${authorityLabel}; repo role docs assign Aurora / Platinum release-path work there and Guardians-focused work here.`);
  lines.push('Guardians has a real whole-run Watch/persona review lane now, but Watch is not yet first-class on the front door and Rival remains intentionally unsupported.');
  lines.push('The next Guardians platform goal is pack-neutral modality support: Watch first, Rival capability modeling second, Rival runtime later.');
  lines.push('The gameplay queue after Watch remains stage-2 whole-run diagnosis first and midrun-stage-five stress second; broad audio work is intentionally deprioritized until gameplay improves.');
  lines.push('Gameplay export ingestion now treats Downloads as an inbox only; durable review artifacts should be imported, then persisted through repo/private/iCloud tiers as appropriate.');
  return lines;
}

function otherMachineState(snapshot, otherMachineNote){
  const lines = [];
  const authority = snapshot.release_authority;
  const dev = snapshot.live_lanes.dev;
  const beta = snapshot.live_lanes.beta;
  if(authority){
    lines.push(`Release authority owner: ${authority.machine_label} (${authority.machine_id}).`);
    lines.push('Best-known repo-owned expectation: that machine handles Aurora / Platinum release continuation, hosted lane discipline, and production-readiness decisions.');
  } else {
    lines.push('Release authority owner: unknown.');
  }
  lines.push(`Live lane snapshot: ${laneSummary('/dev', snapshot.live_lanes.dev)}; ${laneSummary('/beta', snapshot.live_lanes.beta)}; ${laneSummary('/production', snapshot.live_lanes.production)}.`);
  if(dev && dev.ok && beta && beta.ok && dev.commit !== beta.commit){
    lines.push('Hosted /dev is currently ahead of hosted /beta, which suggests active release-path review or cleanup work is still ongoing on the authority machine.');
  }
  if(otherMachineNote){
    lines.push(`Operator note: ${otherMachineNote}`);
  }
  return lines;
}

function focusSuggestions(snapshot){
  const branch = snapshot.repo.branch || '';
  const onGuardians = branch.includes('guardians');
  if(onGuardians || (snapshot.release_authority && !snapshot.release_authority.current_machine_matches)){
    return [
      'Make Guardians Watch first-class by decoupling Watch visibility from the Aurora-only 2UP gate.',
      'Introduce or finish pack-neutral modality capability helpers so Watch and Rival are modeled separately.',
      'Surface Guardians Watch on the normal front door with Intermediate as the default persona and clear score-not-recorded behavior.',
      'Add or refresh Guardians Watch acceptance checks so front-door Watch, progression, and results behavior are verified, not just assumed.',
      'Once Watch is stable, return to the carried gameplay queue: target stage-2 whole-run diagnosis first, then midrun-stage-five stress.'
    ];
  }
  return [
    'Refresh the current machine and branch state before taking on new gameplay or release work.',
    'Review the release authority and live lane posture before touching publish-related tooling.',
    'Read the current handoff and planning docs for the active machine split.',
    'Choose the next focused branch or workstream before starting broad changes.',
    'Keep artifacts and generated evidence in the repo/private/iCloud tiers rather than in ad hoc local folders.'
  ];
}

function printSection(title, lines){
  console.log(`\n## ${title}`);
  for(const line of lines){
    console.log(`- ${line}`);
  }
}

async function main(){
  const args = parseArgs(process.argv.slice(2));
  const snapshot = await gatherMachineSnapshot({ includePublic: false });
  const docs = DOCS.map(readDocTitle);
  const head = gitLine(['log', '-1', '--oneline', '--decorate']) || '(unknown HEAD)';
  const status = gitLine(['status', '--short', '--branch']) || '(unknown status)';
  const nextFocus = focusSuggestions(snapshot);

  console.log('# Codex Session Startup Brief');
  console.log(`Generated: ${new Date().toISOString()}`);

  printSection('Repo', [
    `Root: ${ROOT}`,
    `Branch: ${snapshot.repo.branch}`,
    `HEAD: ${head}`,
    `Git status: ${status}`
  ]);

  printSection('Machine', [
    `Current machine: ${snapshot.machine.machine_label} (${snapshot.machine.machine_id})`,
    `Release authority: ${snapshot.release_authority ? `${snapshot.release_authority.machine_label} (${snapshot.release_authority.machine_id})` : 'unknown'}`,
    `Publish permitted here: ${snapshot.readiness.release === 'ready' ? 'yes' : 'no'}`,
    localServiceSummary(snapshot.local_services.game, 'Local game'),
    localServiceSummary(snapshot.local_services.viewer, 'Local viewer')
  ]);

  printSection('Planning Docs Reviewed', docs.map((doc) => `${doc.relPath} - ${doc.title}`));
  printSection('State Of Work', generalState(snapshot));
  printSection('Other Machine', otherMachineState(snapshot, args['other-machine-note']));
  printSection('Suggested Focus For This Session', nextFocus);

  printSection('Helpful Commands', [
    'npm run machine:status',
    'npm run release:show-authority',
    'npm run local:resume',
    'npm run harness:run:guardians-fullrun',
    'npm run harness:check:portable-paths'
  ]);
}

main().catch((err) => {
  console.error(err && err.stack ? err.stack : String(err));
  process.exit(1);
});

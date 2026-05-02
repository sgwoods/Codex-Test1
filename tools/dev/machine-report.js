#!/usr/bin/env node
const path = require('path');
const {
  ROOT,
  MACHINE_PROFILE_FILE,
  currentIdentity,
  readJsonIfExists,
  readReleaseAuthority,
  machineIsAuthority,
  gitStatusSummary,
  toolChecks,
  buildMachineProfile,
  checkRepoRemote,
  localServiceStatus,
  liveLaneStatus,
  publicStatusChecks,
  nextCommands
} = require('./machine-common');

async function gatherMachineSnapshot({ includePublic = false } = {}){
  const identity = currentIdentity();
  const profile = readJsonIfExists(MACHINE_PROFILE_FILE);
  const authority = readReleaseAuthority();
  const repo = gitStatusSummary();
  const tools = toolChecks();
  const remotes = checkRepoRemote();
  const services = await localServiceStatus();
  const lanes = await liveLaneStatus();
  const authorityMatch = machineIsAuthority(identity, authority);
  const productionFocus = require(path.join(ROOT, 'release-dashboard.json')).currentFocus || '';
  const productionVersion = lanes.production && lanes.production.ok ? lanes.production.version : '1.2.3';
  const publicChecks = includePublic
    ? await publicStatusChecks(productionFocus, productionVersion)
    : null;

  const developmentBlocked = [];
  if(!tools.npm.ok) developmentBlocked.push('npm');
  if(!tools.python3.ok) developmentBlocked.push('python3');
  if(!tools.harness_browser.ok) developmentBlocked.push('playwright-managed chromium');
  if(!remotes.ok) developmentBlocked.push('origin remote');

  const releaseBlocked = [];
  if(!tools.gh.ok) releaseBlocked.push('gh');
  if(!tools.gh.authenticated) releaseBlocked.push('gh auth');
  if(!authority) releaseBlocked.push('release authority file');
  if(authority && !authorityMatch) releaseBlocked.push('release authority mismatch');
  if(repo.branch !== 'main') releaseBlocked.push('not on main');
  if(repo.dirty && repo.branch === 'main') releaseBlocked.push('dirty main');

  const profilePreview = buildMachineProfile(identity, tools, profile && profile.last_successful_bootstrap_at || null);

  return {
    ok: developmentBlocked.length === 0,
    root: ROOT,
    machine: {
      ...identity,
      profile_exists: Boolean(profile),
      profile_path: MACHINE_PROFILE_FILE,
      profile_preview: profilePreview
    },
    repo: {
      ...repo,
      remote_ok: remotes.ok
    },
    tools,
    release_authority: authority ? {
      ...authority,
      current_machine_matches: authorityMatch
    } : null,
    local_services: services,
    live_lanes: lanes,
    public_sync: publicChecks,
    readiness: {
      development: developmentBlocked.length ? 'blocked' : 'ready',
      release: releaseBlocked.length ? 'blocked' : 'ready',
      development_blockers: developmentBlocked,
      release_blockers: releaseBlocked
    },
    next: nextCommands(identity, authorityMatch)
  };
}

module.exports = {
  gatherMachineSnapshot
};

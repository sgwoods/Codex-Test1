#!/usr/bin/env node
const { currentIdentity, readReleaseAuthority, machineIsAuthority } = require('../dev/machine-common');

const authority = readReleaseAuthority();
const identity = currentIdentity();

console.log(JSON.stringify({
  ok: Boolean(authority),
  current_machine: identity,
  release_authority: authority,
  current_machine_matches: machineIsAuthority(identity, authority)
}, null, 2));

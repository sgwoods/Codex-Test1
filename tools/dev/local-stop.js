#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const STATE_DIR = path.join(ROOT, '.local-services');

const SERVICES = [
  { name: 'game', pid: path.join(STATE_DIR, 'game.pid') },
  { name: 'viewer', pid: path.join(STATE_DIR, 'viewer.pid') }
];

function stopService(service){
  if(!fs.existsSync(service.pid)){
    return { name: service.name, status: 'not-tracked' };
  }
  const pid = +(fs.readFileSync(service.pid, 'utf8').trim());
  try {
    process.kill(pid, 'SIGTERM');
    fs.rmSync(service.pid, { force: true });
    return { name: service.name, status: 'stopped', pid };
  } catch {
    fs.rmSync(service.pid, { force: true });
    return { name: service.name, status: 'stale-pid', pid };
  }
}

const results = SERVICES.map(stopService);
console.log(JSON.stringify({ ok: true, root: ROOT, results }, null, 2));

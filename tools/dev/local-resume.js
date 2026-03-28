#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const STATE_DIR = path.join(ROOT, '.local-services');
const NODE = process.execPath;

const SERVICES = [
  {
    name: 'game',
    url: 'http://127.0.0.1:8000/',
    log: path.join(STATE_DIR, 'game.log'),
    pid: path.join(STATE_DIR, 'game.pid'),
    command: ['python3', '-m', 'http.server', '8000', '--directory', 'dist/dev']
  },
  {
    name: 'viewer',
    url: 'http://127.0.0.1:4311/api/runs',
    log: path.join(STATE_DIR, 'viewer.log'),
    pid: path.join(STATE_DIR, 'viewer.pid'),
    command: [NODE, path.join(ROOT, 'tools', 'log-viewer', 'server.js')]
  }
];

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
}

function probe(url){
  return new Promise(resolve => {
    const req = http.get(url, res => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function startService(service){
  ensureDir(STATE_DIR);
  const logFd = fs.openSync(service.log, 'a');
  const child = spawn(service.command[0], service.command.slice(1), {
    cwd: ROOT,
    detached: true,
    stdio: ['ignore', logFd, logFd]
  });
  child.unref();
  fs.writeFileSync(service.pid, String(child.pid));
  return child.pid;
}

async function main(){
  const results = [];
  for(const service of SERVICES){
    const running = await probe(service.url);
    if(running){
      results.push({
        name: service.name,
        status: 'running',
        url: service.url
      });
      continue;
    }
    const pid = startService(service);
    results.push({
      name: service.name,
      status: 'started',
      pid,
      url: service.url
    });
  }

  console.log(JSON.stringify({
    ok: true,
    root: ROOT,
    results
  }, null, 2));
}

main().catch(err => {
  console.error(err && err.stack ? err.stack : String(err));
  process.exit(1);
});

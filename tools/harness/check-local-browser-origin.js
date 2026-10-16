#!/usr/bin/env node
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const { once } = require('node:events');
const { LOCAL_BIND_HOST, localOrigin, localUrl } = require('../dev/local-host-config');

async function main(){
  assert.equal(LOCAL_BIND_HOST, '127.0.0.1');
  assert.equal(localOrigin(8000), 'http://127.0.0.1:8000');
  assert.equal(localUrl(8001, '/', { browser: true }), 'http://localhost:8001/');
  assert.equal(localUrl(4311, 'api/runs', { browser: true }), 'http://localhost:4311/api/runs');
  const configPath = path.join(__dirname, '../dev/local-host-config.js');
  const override = spawnSync(process.execPath, ['-e',
    `const c=require(${JSON.stringify(configPath)});console.log(JSON.stringify([c.localOrigin(9),c.localUrl(9,'x',{browser:true,protocol:'https'})]));`
  ], { encoding: 'utf8', env: { ...process.env, AURORA_LOCAL_BIND_HOST: '127.0.0.2', AURORA_LOCAL_BROWSER_HOST: 'review.localhost' } });
  assert.equal(override.status, 0, override.stderr);
  assert.deepEqual(JSON.parse(override.stdout), ['http://127.0.0.2:9', 'https://review.localhost:9/x']);
  const viewer = spawn(process.execPath, [path.join(__dirname, '../log-viewer/server.js')], {
    env: { ...process.env, LOG_VIEWER_PORT: '0' }, stdio: ['ignore', 'pipe', 'pipe']
  });
  let stdout = ''; let stderr = '';
  viewer.stderr.on('data', data => { stderr += data; });
  try{
    const advertised = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`Viewer startup timeout: ${stderr}`)), 8000);
      viewer.once('error', error => { clearTimeout(timeout); reject(error); });
      viewer.once('exit', code => { clearTimeout(timeout); reject(new Error(`Viewer exited ${code}: ${stderr}`)); });
      viewer.stdout.on('data', data => {
        stdout += data;
        try{ const value = JSON.parse(stdout); clearTimeout(timeout); resolve(value); }catch{}
      });
    });
    assert.equal(advertised.ok, true);
    const url = new URL(advertised.url);
    assert.equal(url.hostname, 'localhost');
    assert(Number(url.port) > 0);
    const response = await fetch(advertised.url, { signal: AbortSignal.timeout(5000) });
    assert.equal(response.status, 200);
    const loopback = await fetch(`http://127.0.0.1:${url.port}/`, { signal: AbortSignal.timeout(5000) });
    assert.equal(loopback.status, 200);
    const runs = await fetch(new URL('api/runs', advertised.url), { signal: AbortSignal.timeout(5000) });
    assert.equal(runs.status, 200);
    assert(Array.isArray((await runs.json()).runs));
    console.log(JSON.stringify({ ok: true, bindHost: LOCAL_BIND_HOST, browserUrl: advertised.url, overrideCheck: 'pass' }));
  }finally{
    if(viewer.exitCode === null){ const exited = once(viewer, 'exit'); viewer.kill(); await exited; }
  }
}
main().catch(error => { console.error(error.stack); process.exitCode = 1; });

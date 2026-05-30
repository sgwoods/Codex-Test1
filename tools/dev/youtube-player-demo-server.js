#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const path = require('path');
const { LOCAL_BIND_HOST, localUrl } = require('./local-host-config');

const ROOT = path.resolve(__dirname, 'youtube-player-demo');
const DEFAULT_PORT = 8311;

function contentType(file) {
  if(file.endsWith('.html')) return 'text/html; charset=utf-8';
  if(file.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if(file.endsWith('.css')) return 'text/css; charset=utf-8';
  if(file.endsWith('.json')) return 'application/json; charset=utf-8';
  return 'application/octet-stream';
}

function requestedPort() {
  const arg = process.argv.find(value => /^--port=/.test(value));
  const raw = arg ? arg.split('=')[1] : process.env.PORT;
  const port = Number(raw || DEFAULT_PORT);
  return Number.isFinite(port) && port > 0 ? port : DEFAULT_PORT;
}

const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent((req.url || '/').split('?')[0]);
  const relative = pathname === '/' ? '/index.html' : pathname;
  const file = path.resolve(ROOT, '.' + relative);
  if(!file.startsWith(ROOT)) {
    res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('forbidden');
    return;
  }
  fs.readFile(file, (error, data) => {
    if(error) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      res.end('not found');
      return;
    }
    res.writeHead(200, {
      'content-type': contentType(file),
      'cache-control': 'no-store'
    });
    res.end(data);
  });
});

server.listen(requestedPort(), LOCAL_BIND_HOST, () => {
  const { port } = server.address();
  console.log(`YouTube Player Demo running at ${localUrl(port, '/', { browser: true })}`);
});

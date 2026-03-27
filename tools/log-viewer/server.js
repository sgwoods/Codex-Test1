#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const STATIC_ROOT = __dirname;
const ARTIFACT_ROOT = path.join(ROOT, 'harness-artifacts');
const CLIP_ROOT = path.join(ARTIFACT_ROOT, 'viewer-clips');
const HOST = '127.0.0.1';
const PORT = +(process.env.LOG_VIEWER_PORT || 4311);

function mime(file){
  if(file.endsWith('.html')) return 'text/html; charset=utf-8';
  if(file.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if(file.endsWith('.css')) return 'text/css; charset=utf-8';
  if(file.endsWith('.json')) return 'application/json; charset=utf-8';
  if(file.endsWith('.webm')) return 'video/webm';
  if(file.endsWith('.mkv')) return 'video/x-matroska';
  return 'application/octet-stream';
}

function safeResolve(base, rel){
  const file = path.resolve(base, '.' + rel);
  return file.startsWith(base) ? file : null;
}

function readJson(file, fallback=null){
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return fallback; }
}

function ensureDir(dir){
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function walk(dir, out=[]){
  for(const ent of fs.readdirSync(dir, { withFileTypes: true })){
    const file = path.join(dir, ent.name);
    if(ent.isDirectory()) walk(file, out);
    else if(ent.isFile() && ent.name === 'summary.json') out.push(file);
  }
  return out;
}

function runVideoFile(summary, dir){
  const files = Array.isArray(summary?.files) ? summary.files : [];
  const candidates = files.filter(file => /\.review\.(webm|mkv)$/.test(file) || /\.webm$/.test(file));
  if(candidates.length) {
    const preferred = candidates.find(file => file.endsWith('.review.webm'))
      || candidates.find(file => file.endsWith('.webm'))
      || candidates[0];
    return path.isAbsolute(preferred) ? preferred : path.join(dir, preferred);
  }
  return null;
}

function sessionFile(summary, dir){
  const files = Array.isArray(summary?.files) ? summary.files : [];
  const file = files.find(f => /neo-galaga-session-.*\.json$/.test(f));
  return file ? (path.isAbsolute(file) ? file : path.join(dir, file)) : null;
}

function summarizeRun(summaryFile){
  const dir = path.dirname(summaryFile);
  const relDir = path.relative(ARTIFACT_ROOT, dir);
  const summary = readJson(summaryFile, {}) || {};
  const analysis = summary.analysis || {};
  const state = summary.state || {};
  const quality = summary.artifactQuality || null;
  const stat = fs.statSync(summaryFile);
  return {
    id: relDir,
    relDir,
    name: summary.name || path.basename(dir),
    persona: summary.persona || null,
    stage: state.stage || summary.config?.stage || null,
    score: state.score || 0,
    lives: state.lives || null,
    duration: analysis.duration || summary.duration || 0,
    challenge: !!state.challenge,
    lossCauseCounts: analysis.lossCauseCounts || {},
    artifactQuality: quality,
    videoFile: runVideoFile(summary, dir) ? path.relative(ROOT, runVideoFile(summary, dir)) : null,
    updatedAt: stat.mtime.toISOString(),
    source: summary.source || null
  };
}

function loadRun(relDir){
  const dir = safeResolve(ARTIFACT_ROOT, '/' + relDir);
  if(!dir || !fs.existsSync(dir)) return null;
  const summary = readJson(path.join(dir, 'summary.json'), {});
  const session = readJson(sessionFile(summary, dir), null);
  const video = runVideoFile(summary, dir);
  return {
    relDir,
    summary,
    session,
    videoUrl: video ? '/artifacts/' + path.relative(ARTIFACT_ROOT, video).split(path.sep).map(encodeURIComponent).join('/') : null,
    sessionUrl: sessionFile(summary, dir) ? '/artifacts/' + path.relative(ARTIFACT_ROOT, sessionFile(summary, dir)).split(path.sep).map(encodeURIComponent).join('/') : null
  };
}

function issueBody(payload){
  const lines = [];
  lines.push('## Context');
  lines.push(payload.context || 'Artifact review issue from the log viewer.');
  lines.push('');
  lines.push('## Artifact');
  if(payload.runId) lines.push(`- Run: \`${payload.runId}\``);
  if(payload.time != null) lines.push(`- Timestamp: \`${payload.time.toFixed(3)}s\``);
  if(payload.videoUrl) lines.push(`- Video: \`${payload.videoUrl}\``);
  if(payload.sessionUrl) lines.push(`- Session: \`${payload.sessionUrl}\``);
  if(payload.clipPath) lines.push(`- Clip: \`${payload.clipPath}\``);
  lines.push('');
  lines.push('## Notes');
  lines.push(payload.notes || '(none)');
  lines.push('');
  if(Array.isArray(payload.events) && payload.events.length){
    lines.push('## Nearby Events');
    for(const evt of payload.events.slice(0, 12)) lines.push(`- ${evt}`);
    lines.push('');
  }
  return lines.join('\n');
}

function saveClip(payload){
  const dataUrl = payload.dataUrl || '';
  const match = dataUrl.match(/^data:image\/png;base64,(.+)$/);
  if(!match) throw new Error('clip must be a PNG data URL');
  const dir = ensureDir(path.join(CLIP_ROOT, new Date().toISOString().slice(0, 10)));
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeRun = String(payload.runId || 'run').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120);
  const file = path.join(dir, `${safeRun}-${stamp}.png`);
  fs.writeFileSync(file, Buffer.from(match[1], 'base64'));
  return {
    file,
    url: '/artifacts/' + path.relative(ARTIFACT_ROOT, file).split(path.sep).map(encodeURIComponent).join('/')
  };
}

function createIssue(payload){
  const res = spawnSync('gh', ['issue', 'create', '--title', payload.title, '--body', issueBody(payload)], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 30000
  });
  if(res.status !== 0){
    throw new Error((res.stderr || res.stdout || 'gh issue create failed').trim());
  }
  return { url: (res.stdout || '').trim() };
}

function sendJson(res, code, data){
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(JSON.stringify(data, null, 2));
}

function collectBody(req){
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if(data.length > 2 * 1024 * 1024) reject(new Error('request too large'));
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${HOST}:${PORT}`);
    if(url.pathname === '/api/runs'){
      const runs = walk(ARTIFACT_ROOT).map(summarizeRun).sort((a,b) => b.updatedAt.localeCompare(a.updatedAt));
      return sendJson(res, 200, { runs });
    }
    if(url.pathname === '/api/run'){
      const relDir = url.searchParams.get('dir') || '';
      const run = loadRun(relDir);
      if(!run) return sendJson(res, 404, { error: 'run not found' });
      return sendJson(res, 200, run);
    }
    if(url.pathname === '/api/issues' && req.method === 'POST'){
      const payload = JSON.parse(await collectBody(req) || '{}');
      if(!payload.title) return sendJson(res, 400, { error: 'title required' });
      const created = createIssue(payload);
      return sendJson(res, 200, created);
    }
    if(url.pathname === '/api/clips' && req.method === 'POST'){
      const payload = JSON.parse(await collectBody(req) || '{}');
      const saved = saveClip(payload);
      return sendJson(res, 200, saved);
    }
    if(url.pathname.startsWith('/artifacts/')){
      const rel = decodeURIComponent(url.pathname.slice('/artifacts'.length));
      const file = safeResolve(ARTIFACT_ROOT, rel);
      if(!file || !fs.existsSync(file)) return sendJson(res, 404, { error: 'file not found' });
      res.writeHead(200, { 'content-type': mime(file), 'cache-control': 'no-store' });
      return fs.createReadStream(file).pipe(res);
    }
    const rel = url.pathname === '/' ? '/index.html' : url.pathname;
    const file = safeResolve(STATIC_ROOT, rel);
    if(!file || !fs.existsSync(file)) return sendJson(res, 404, { error: 'not found' });
    res.writeHead(200, { 'content-type': mime(file), 'cache-control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  } catch (err) {
    sendJson(res, 500, { error: err.message || String(err) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(JSON.stringify({ ok: true, url: `http://${HOST}:${PORT}/` }, null, 2));
});

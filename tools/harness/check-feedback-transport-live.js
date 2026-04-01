#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const BUILT_INDEX = path.join(__dirname, '..', '..', 'dist', 'dev', 'index.html');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readFeedbackConfig(){
  const src = fs.readFileSync(BUILT_INDEX, 'utf8');
  const accessKeyMatch = src.match(/const WEB3FORMS_ACCESS_KEY='([^']+)'/);
  if(!accessKeyMatch) throw new Error('Could not locate WEB3FORMS_ACCESS_KEY in built dev output');
  const accessKey = accessKeyMatch[1];
  return {
    accessKey,
    endpoint: 'https://api.web3forms.com/submit'
  };
}

async function main(){
  const { accessKey, endpoint } = readFeedbackConfig();
  if(!accessKey || accessKey.includes('{{')){
    fail('Feedback transport probe is missing WEB3FORMS_ACCESS_KEY in the built source');
  }
  const stamp = new Date().toISOString();
  const form = new FormData();
  form.set('access_key', accessKey);
  form.set('subject', `[Harness Probe] Aurora feedback transport ${stamp}`);
  form.set('from_name', 'Aurora Galactica');
  form.set('botcheck', '');
  form.set('product', 'Aurora Galactica');
  form.set('type', 'Harness Probe');
  form.set('title', 'Feedback transport probe');
  form.set('description', 'Automated release-process probe of the external FormSubmit transport.');
  form.set('build', 'release-probe');
  form.set('timestamp', stamp);
  form.set('message', `Aurora Galactica feedback transport probe\nTimestamp: ${stamp}\nEndpoint: ${endpoint}`);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: form
  });
  const contentType = String(response.headers.get('content-type') || '').toLowerCase();
  const payload = {
    ok: response.ok,
    status: response.status,
    endpoint
  };

  if(contentType.includes('application/json')){
    payload.body = await response.json().catch(() => null);
  } else {
    payload.body = (await response.text().catch(() => '')).trim();
  }

  if(!response.ok || payload.body?.success === false){
    fail('Feedback transport probe failed', payload);
  }

  console.log(JSON.stringify({ ok: true, ...payload }, null, 2));
}

main().catch(err => fail(err && err.stack || String(err)));

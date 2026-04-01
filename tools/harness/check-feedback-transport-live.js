#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SOURCE = path.join(__dirname, '..', '..', 'src', 'js', '00-boot.js');

function fail(message, payload){
  console.error(message);
  if(payload) console.error(JSON.stringify(payload, null, 2));
  process.exit(1);
}

function readFeedbackConfig(){
  const src = fs.readFileSync(SOURCE, 'utf8');
  const emailMatch = src.match(/const MODEM_FEATURE_EMAIL='([^']+)'/);
  if(!emailMatch) throw new Error('Could not locate MODEM_FEATURE_EMAIL in 00-boot.js');
  const email = emailMatch[1];
  return {
    email,
    endpoint: `https://formsubmit.co/ajax/${email}`
  };
}

async function main(){
  const { email, endpoint } = readFeedbackConfig();
  const stamp = new Date().toISOString();
  const form = new FormData();
  form.set('_subject', `[Harness Probe] Aurora feedback transport ${stamp}`);
  form.set('_template', 'table');
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
    endpoint,
    email
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

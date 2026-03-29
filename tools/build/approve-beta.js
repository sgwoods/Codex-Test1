#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
  DIST_BETA,
  BETA_BUILD_INFO,
  BETA_APPROVED_BUILD_INFO
} = require('./paths');

if(!fs.existsSync(DIST_BETA) || !fs.existsSync(BETA_BUILD_INFO)){
  throw new Error(`Missing beta artifacts. Run "npm run build && npm run promote:beta" first.`);
}

const info = JSON.parse(fs.readFileSync(BETA_BUILD_INFO, 'utf8'));
const approved = {
  ...info,
  approvedAt: new Date().toISOString(),
  approvalSource: 'local-beta-approval'
};

fs.writeFileSync(BETA_APPROVED_BUILD_INFO, JSON.stringify(approved, null, 2) + '\n');
console.log(`Approved beta candidate ${info.label} -> ${path.relative(process.cwd(), BETA_APPROVED_BUILD_INFO)}`);

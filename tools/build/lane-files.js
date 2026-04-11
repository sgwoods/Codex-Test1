const fs = require('fs');
const path = require('path');

const DEV_BASE_FILES = Object.freeze([
  'index.html',
  'release-dashboard.html',
  'project-guide.html',
  'application-guide.html',
  'platinum-guide.html',
  'player-guide.html',
  'build-info.json',
  'release-notes.json',
  'export.mov.png'
]);

const BETA_BASE_FILES = Object.freeze([
  ...DEV_BASE_FILES,
  'README.md',
  'README.txt'
]);

const PRODUCTION_BASE_FILES = Object.freeze([
  ...DEV_BASE_FILES,
  'README.md'
]);

function listFilesRecursive(rootDir, prefix = ''){
  const start = prefix ? path.join(rootDir, prefix) : rootDir;
  if(!fs.existsSync(start)) return [];
  const results = [];
  const stack = [start];
  while(stack.length){
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for(const entry of entries){
      const full = path.join(current, entry.name);
      if(entry.isDirectory()){
        stack.push(full);
        continue;
      }
      if(entry.isFile()){
        results.push(path.relative(rootDir, full).replace(/\\/g, '/'));
      }
    }
  }
  results.sort();
  return results;
}

function assetFilesForDist(distDir){
  return listFilesRecursive(distDir, 'assets');
}

function uniqueFiles(files){
  return Array.from(new Set((files || []).filter(Boolean)));
}

function devFiles(distDir){
  return uniqueFiles([...DEV_BASE_FILES, ...assetFilesForDist(distDir)]);
}

function betaFiles(distDir){
  return uniqueFiles([...BETA_BASE_FILES, ...assetFilesForDist(distDir)]);
}

function productionFiles(distDir){
  return uniqueFiles([...PRODUCTION_BASE_FILES, ...assetFilesForDist(distDir)]);
}

module.exports = {
  DEV_BASE_FILES,
  BETA_BASE_FILES,
  PRODUCTION_BASE_FILES,
  assetFilesForDist,
  devFiles,
  betaFiles,
  productionFiles
};

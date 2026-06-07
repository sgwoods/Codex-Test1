const fs = require('fs');
const os = require('os');
const path = require('path');

const HOME = os.homedir();

const DOWNLOADS_INBOX = path.join(HOME, 'Downloads');
const ICLOUD_ARTIFACT_LIBRARY_ROOT = path.join(
  HOME,
  'Library',
  'Mobile Documents',
  'com~apple~CloudDocs',
  'Projects',
  'Codex-Test1 Artifact Library'
);

const ICLOUD_BUCKETS = {
  temporaryThrowaway: path.join(ICLOUD_ARTIFACT_LIBRARY_ROOT, '00-temporary-throwaway'),
  transientInUse: path.join(ICLOUD_ARTIFACT_LIBRARY_ROOT, '01-transient-in-use'),
  documentation: path.join(ICLOUD_ARTIFACT_LIBRARY_ROOT, '02-documentation'),
  production: path.join(ICLOUD_ARTIFACT_LIBRARY_ROOT, '03-production')
};

const BROWSER_EXPORT_INBOX = path.join(ICLOUD_BUCKETS.temporaryThrowaway, 'browser-export-inbox');

function normalizeDir(file){
  return path.resolve(String(file || ''));
}

function uniqueDirs(list){
  const seen = new Set();
  const out = [];
  for(const item of list || []){
    if(!item) continue;
    const dir = normalizeDir(item);
    if(seen.has(dir)) continue;
    seen.add(dir);
    out.push(dir);
  }
  return out;
}

function defaultImportSourceDirs(){
  return uniqueDirs([
    DOWNLOADS_INBOX,
    BROWSER_EXPORT_INBOX
  ]);
}

function resolveImportSourceDirs(source){
  if(source) return uniqueDirs([source]);
  return defaultImportSourceDirs();
}

function describeImportSourcePolicy(){
  return {
    defaultImportSourceDirs: defaultImportSourceDirs(),
    downloadsInbox: DOWNLOADS_INBOX,
    iCloudArtifactLibraryRoot: ICLOUD_ARTIFACT_LIBRARY_ROOT,
    iCloudBrowserExportInbox: BROWSER_EXPORT_INBOX
  };
}

function importInboxDescriptors(){
  return [
    {
      key: 'downloads-inbox',
      path: DOWNLOADS_INBOX,
      create: false,
      required: false
    },
    {
      key: 'browser-export-inbox',
      path: BROWSER_EXPORT_INBOX,
      create: true,
      required: true
    }
  ];
}

function ensureImportInboxes(){
  return importInboxDescriptors().map((descriptor) => {
    const existed = fs.existsSync(descriptor.path);
    let error = null;
    if(!existed && descriptor.create){
      try{
        fs.mkdirSync(descriptor.path, { recursive: true });
      } catch(err){
        error = err && err.message ? err.message : String(err);
      }
    }
    const exists = fs.existsSync(descriptor.path);
    if(descriptor.required && !exists && !error){
      error = 'Required import inbox is unavailable.';
    }
    return {
      key: descriptor.key,
      path: descriptor.path,
      required: descriptor.required,
      create: descriptor.create,
      existed,
      created: !existed && exists,
      exists,
      error
    };
  });
}

module.exports = {
  BROWSER_EXPORT_INBOX,
  DOWNLOADS_INBOX,
  ICLOUD_ARTIFACT_LIBRARY_ROOT,
  ICLOUD_BUCKETS,
  defaultImportSourceDirs,
  describeImportSourcePolicy,
  ensureImportInboxes,
  importInboxDescriptors,
  resolveImportSourceDirs
};

function trim(value){
  return String(value || '').trim();
}

function unique(values){
  return Array.from(new Set(values.filter(Boolean)));
}

function inferLane(buildInfo = {}, fallbackLane = ''){
  const explicit = trim(fallbackLane).toLowerCase();
  if(explicit) return explicit;
  const channel = trim(buildInfo.releaseChannel).toLowerCase();
  if(channel.includes('beta')) return 'beta';
  if(channel === 'production') return 'production';
  return 'dev';
}

function preferredVersions(buildInfo = {}, lane = ''){
  const resolvedLane = inferLane(buildInfo, lane);
  const version = trim(buildInfo.version);
  const versionLine = trim(buildInfo.versionLine);
  if(resolvedLane === 'dev'){
    return unique([
      versionLine ? `${versionLine}-dev` : '',
      versionLine,
      version ? `${version}-dev` : '',
      version
    ]);
  }
  return unique([version, versionLine]);
}

function selectReleaseNoteForBuild(notes, buildInfo = {}, options = {}){
  if(!Array.isArray(notes) || !notes.length) return null;
  const lane = inferLane(buildInfo, options.lane);
  const versions = preferredVersions(buildInfo, lane);
  for(const version of versions){
    const note = notes.find((entry) => trim(entry.version) === version);
    if(note) return note;
  }
  return notes[0] || null;
}

module.exports = {
  inferLane,
  preferredVersions,
  selectReleaseNoteForBuild
};

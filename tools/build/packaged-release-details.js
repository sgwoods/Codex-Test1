const marker = /(<script type="application\/json" id="buildReleaseDetails">)[\s\S]*?(<\/script>)/;

function serializeReleaseDetails(info){
  const note = info.latestReleaseNote || {};
  return JSON.stringify({
    label: info.label, version: info.version, buildNumber: info.buildNumber,
    commit: info.commit, lane: info.releaseChannel,
    builtAt: info.builtAtEt || info.builtAtUtc,
    note: { title: note.title, date: note.date, summary: note.summary, version: note.version }
  }).replace(/</g, '\\u003c');
}

function rewriteReleaseDetails(html, info){
  // Older approved artifacts have no embedded details; leave them untouched.
  return html.replace(marker, (_, start, end) => start + serializeReleaseDetails(info) + end);
}

module.exports = { serializeReleaseDetails, rewriteReleaseDetails };

const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DIST = path.join(ROOT, 'dist');
const DIST_DEV = path.join(DIST, 'dev');
const DIST_PRODUCTION = path.join(DIST, 'production');
const DIST_BETA = path.join(DIST, 'beta');

module.exports = {
  ROOT,
  DIST,
  DIST_DEV,
  DIST_PRODUCTION,
  DIST_BETA,
  DEV_INDEX: path.join(DIST_DEV, 'index.html'),
  DEV_DASHBOARD: path.join(DIST_DEV, 'release-dashboard.html'),
  DEV_PROJECT_GUIDE: path.join(DIST_DEV, 'project-guide.html'),
  DEV_PLAYER_GUIDE: path.join(DIST_DEV, 'player-guide.html'),
  DEV_BUILD_INFO: path.join(DIST_DEV, 'build-info.json'),
  DEV_SCREENSHOT: path.join(DIST_DEV, 'export.mov.png'),
  PRODUCTION_INDEX: path.join(DIST_PRODUCTION, 'index.html'),
  PRODUCTION_DASHBOARD: path.join(DIST_PRODUCTION, 'release-dashboard.html'),
  PRODUCTION_PROJECT_GUIDE: path.join(DIST_PRODUCTION, 'project-guide.html'),
  PRODUCTION_PLAYER_GUIDE: path.join(DIST_PRODUCTION, 'player-guide.html'),
  PRODUCTION_BUILD_INFO: path.join(DIST_PRODUCTION, 'build-info.json'),
  PRODUCTION_SCREENSHOT: path.join(DIST_PRODUCTION, 'export.mov.png'),
  BETA_INDEX: path.join(DIST_BETA, 'index.html'),
  BETA_DASHBOARD: path.join(DIST_BETA, 'release-dashboard.html'),
  BETA_PROJECT_GUIDE: path.join(DIST_BETA, 'project-guide.html'),
  BETA_PLAYER_GUIDE: path.join(DIST_BETA, 'player-guide.html'),
  BETA_BUILD_INFO: path.join(DIST_BETA, 'build-info.json'),
  BETA_APPROVED_BUILD_INFO: path.join(DIST_BETA, 'approved-build-info.json')
};

const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DIST = path.join(ROOT, 'dist');
const DIST_PRODUCTION = path.join(DIST, 'production');
const DIST_BETA = path.join(DIST, 'beta');

module.exports = {
  ROOT,
  DIST,
  DIST_PRODUCTION,
  DIST_BETA,
  PRODUCTION_INDEX: path.join(DIST_PRODUCTION, 'index.html'),
  PRODUCTION_DASHBOARD: path.join(DIST_PRODUCTION, 'release-dashboard.html'),
  PRODUCTION_PROJECT_GUIDE: path.join(DIST_PRODUCTION, 'project-guide.html'),
  PRODUCTION_BUILD_INFO: path.join(DIST_PRODUCTION, 'build-info.json'),
  PRODUCTION_SCREENSHOT: path.join(DIST_PRODUCTION, 'export.mov.png'),
  BETA_INDEX: path.join(DIST_BETA, 'index.html'),
  BETA_DASHBOARD: path.join(DIST_BETA, 'release-dashboard.html'),
  BETA_PROJECT_GUIDE: path.join(DIST_BETA, 'project-guide.html'),
  BETA_BUILD_INFO: path.join(DIST_BETA, 'build-info.json')
};

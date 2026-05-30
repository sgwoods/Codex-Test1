const LOCAL_BIND_HOST = process.env.AURORA_LOCAL_BIND_HOST || '127.0.0.1';
const LOCAL_BROWSER_HOST = process.env.AURORA_LOCAL_BROWSER_HOST || 'localhost';

function normalizePathname(pathname = '/'){
  if(!pathname) return '/';
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

function localOrigin(port, options = {}){
  const protocol = options.protocol || 'http';
  const host = options.browser ? LOCAL_BROWSER_HOST : LOCAL_BIND_HOST;
  return `${protocol}://${host}:${port}`;
}

function localUrl(port, pathname = '/', options = {}){
  return `${localOrigin(port, options)}${normalizePathname(pathname)}`;
}

module.exports = {
  LOCAL_BIND_HOST,
  LOCAL_BROWSER_HOST,
  localOrigin,
  localUrl
};

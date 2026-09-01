const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const forcedRoots = {
  react: path.resolve(__dirname, 'node_modules/react'),
  'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
};

function matchForcedRoot(moduleName) {
  for (const pkg of Object.keys(forcedRoots)) {
    if (moduleName === pkg || moduleName.startsWith(pkg + '/')) {
      return pkg;
    }
  }
  return null;
}

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const pkg = matchForcedRoot(moduleName);
  if (pkg) {
    return context.resolveRequest(
      { ...context, originModulePath: forcedRoots[pkg] },
      moduleName,
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

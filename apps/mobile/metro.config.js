const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const forcedModules = {
  react: path.resolve(__dirname, 'node_modules/react'),
  'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (forcedModules[moduleName]) {
    return context.resolveRequest(
      { ...context, originModulePath: forcedModules[moduleName] },
      moduleName,
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

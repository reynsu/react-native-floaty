// Metro can't resolve packages linked via file: outside its project root unless
// we extend watchFolders to include the package source. We also force shared
// peer deps (react, react-native) to resolve to the example's copies — the
// linked package's parent has its own node_modules with different versions
// that would otherwise win when imported from the package source.
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const packageRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [packageRoot];

// Pin shared deps to the example's node_modules so the package source
// resolves through the same React/RN instance the app uses.
const exampleModules = path.resolve(projectRoot, 'node_modules');
config.resolver.extraNodeModules = {
  react: path.resolve(exampleModules, 'react'),
  'react-native': path.resolve(exampleModules, 'react-native'),
  'react-dom': path.resolve(exampleModules, 'react-dom'),
};

module.exports = config;

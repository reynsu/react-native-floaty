// Metro can't resolve packages linked via file: outside its project root unless
// we extend watchFolders + nodeModulesPaths to include the parent (the package
// source) and also disable hierarchical lookup so the example's node_modules
// always wins for shared deps (react, react-native).
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const packageRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [packageRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(packageRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

module.exports = config;

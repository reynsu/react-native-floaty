// The example links the package via `file:..`, which npm turns into a symlink
// to the parent directory. Two problems to solve:
//
//   1. Metro's hierarchical resolver, when processing the package source, will
//      walk UP from `react-native-floaty/src/*.ts` and find the parent's
//      `node_modules/react-native` (RN 0.74, kept for the lib's own jest
//      setup) before reaching the example's RN 0.81. Two RN copies → empty
//      TurboModule registry at runtime → "PlatformConstants could not be
//      found" crash.
//
//   2. If we just blockList the parent's node_modules, the lib's source can no
//      longer find `react-native` at all.
//
// Solution: blockList + extraNodeModules together. Block the parent's
// node_modules so its old React/RN never gets scanned, and explicitly alias
// the shared peer deps to the example's copies so the lib source still
// resolves them.
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const packageRoot = path.resolve(projectRoot, '..');
const exampleModules = path.resolve(projectRoot, 'node_modules');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [packageRoot];

const escapedParent = packageRoot.replace(/[/\\]/g, '[/\\\\]');
config.resolver.blockList = [
  new RegExp(`${escapedParent}[/\\\\]node_modules[/\\\\].*`),
];

// `react-native-web` is required for the web target because Expo's web
// preset rewrites `import 'react-native'` → `react-native-web/dist/exports/...`
// at bundle time. With the parent blocked, the lib's dist/ can't find it
// without an explicit alias.
config.resolver.extraNodeModules = {
  react: path.resolve(exampleModules, 'react'),
  'react-native': path.resolve(exampleModules, 'react-native'),
  'react-native-web': path.resolve(exampleModules, 'react-native-web'),
  'react-dom': path.resolve(exampleModules, 'react-dom'),
};

module.exports = config;

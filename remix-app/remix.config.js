/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ['.*', '**/*.css', '**/*.test.{js,jsx,ts,tsx}', 'README.md'],
  assetsBuildDirectory: 'public/build',
  publicPath: '/build/',
  serverBuildPath: 'build/index.js',
  serverBuildTarget: 'node-cjs',
  server: undefined,
  appDirectory: 'app',
  serverDependenciesToBundle: ['franc', 'trigram-utils', 'n-gram', 'collapse-white-space'],
};

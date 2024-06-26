/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['@remix-run/eslint-config', '@remix-run/eslint-config/node', '../.eslintrc.js'],
  ignorePatterns: ['node_modules', 'server', 'public', 'build', '**.css', 'sst-env.d.ts'],
};

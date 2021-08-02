/* eslint-disable */
module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
  },
  env: {
    es6: true,
    browser: true,
    mocha: true,
    node: true,
  },
  globals: {
    module: true,
    process: true,
  },
  ignorePatterns: ['public/build/'],
  settings: { 'svelte3/ignore-styles': () => true },
  plugins: ['svelte3'],
  extends: ['eslint:recommended', 'plugin:cypress/recommended'],
  overrides: [
    {
      files: ['*.svelte'],
      processor: 'svelte3/svelte3',
    },
  ],
};

/* eslint-disable */
module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
  },
  env: {
    es6: true,
    browser: true,
  },
  globals: {
    module: true,
    process: true,
    node: true,
    mocha: true,
  },
  rules: {
    // ...
  },
  ignorePatterns: ['public/build/'],
  settings: { 'svelte3/ignore-styles': () => true },
  plugins: ['svelte3'],
  extends: 'eslint:recommended',
  overrides: [
    {
      files: ['*.svelte'],
      processor: 'svelte3/svelte3',
    },
  ],
};

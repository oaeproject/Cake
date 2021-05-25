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
  rules: {
    '@babel/new-cap': 'error',
    '@babel/no-invalid-this': 'error',
    '@babel/no-unused-expressions': 'error',
    '@babel/object-curly-spacing': 'error',
    '@babel/semi': 'error',
  },
  ignorePatterns: ['public/build/'],
  settings: { 'svelte3/ignore-styles': () => true },
  plugins: ['svelte3', '@babel'],
  extends: 'eslint:recommended',
  overrides: [
    {
      files: ['*.svelte'],
      processor: 'svelte3/svelte3',
    },
  ],
};

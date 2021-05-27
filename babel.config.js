module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        /* These settings are needed if transpiling to ES5 I think */
        // useBuiltIns: 'usage',
        // corejs: 3,
        // loose: true,

        // No need for babel to resolve modules
        modules: false,
        targets: {
          // ! Very important. Target es6+
          esmodules: true,
        },
      },
    ],
  ],
  plugins: ['@babel/plugin-proposal-private-property-in-object', '@babel/plugin-syntax-dynamic-import'],
};

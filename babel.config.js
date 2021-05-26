module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        // useBuiltIns: 'usage',
        // corejs: 3,
        loose: true,
        // No need for babel to resolve modules
        modules: false,
        targets: {
          // ! Very important. Target es6+
          esmodules: true,
        },
      },
    ],
  ],
};

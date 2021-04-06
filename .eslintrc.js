// .eslintrc.js
'use strict';

const { configs } = require('@nullvoxpopuli/eslint-configs');

const config = configs.node();

module.exports = {
  ...config,
  overrides: [
    ...config.overrides,
    {
      files: ['src/**'],
      parserOptions: {
        sourceType: 'module',
      },
      rules: {
        'import/exports-last': 'off',
        'node/no-unsupported-features/es-syntax': 'off',
      },
    },
  ],
};

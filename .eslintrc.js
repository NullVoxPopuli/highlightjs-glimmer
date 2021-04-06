// .eslintrc.js
'use strict';

const { configs } = require('@nullvoxpopuli/eslint-configs');

// TODO: do I need to make a node-es-modules config?
// or just allow mixed cjs and modules?
const config = configs.node();

module.exports = {
  ...config,
  overrides: [
    ...config.overrides,
    {
      files: ['src/**', 'tests/**'],
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

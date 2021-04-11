// .eslintrc.js
'use strict';

const { configs } = require('@nullvoxpopuli/eslint-configs');

const mjs = configs.nodeES();

module.exports = {
  ...mjs,
  overrides: [
    ...mjs.overrides,
    // pull this in to eslint-configs?
    {
      files: ['*.html'],
      plugins: ['html'],
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2021,
      },
    },
  ],
};

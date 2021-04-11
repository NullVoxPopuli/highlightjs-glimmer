// .eslintrc.js
'use strict';

const { configs } = require('@nullvoxpopuli/eslint-configs');
const {
  jsBase,
  moduleBase,
  baseRulesAppliedLast,
} = require('@nullvoxpopuli/eslint-configs/configs/base');

const mjs = configs.nodeES();

module.exports = {
  ...mjs,
  overrides: [
    ...mjs.overrides,
    // pull this in to eslint-configs?
    {
      ...jsBase,
      files: ['*.html'],
      plugins: [moduleBase.plugins, 'html'].flat(),
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2021,
      },
      extends: ['eslint:recommended', 'prettier'],
      rules: {
        ...jsBase.rules,
        ...baseRulesAppliedLast,
      },
    },
  ],
};

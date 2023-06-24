// .eslintrc.js
'use strict';

const { configBuilder } = require('@nullvoxpopuli/eslint-configs/configs/node');
const { forFiles } = require('@nullvoxpopuli/eslint-configs/configs/-utils');

const config = configBuilder();
const modulesBase = config.modules.js;

module.exports = {
  overrides: [
    // pull this in to eslint-configs?
    {
      files: ['*.html'],
      plugins: [modulesBase.plugins, 'html'].flat(),
      parser: '@babel/eslint-parser',
      parserOptions: {
        requireConfigFile: false,
        sourceType: 'module',
        ecmaVersion: 2021,
      },
      env: {
        browser: true,
        node: false,
      },
      extends: ['eslint:recommended', 'prettier'],
      rules: {
        ...modulesBase.rules,
        'no-console': 'off',
      },
    },
    forFiles('*.cjs', config.commonjs.js),
  ],
};

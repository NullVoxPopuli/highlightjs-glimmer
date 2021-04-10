// .eslintrc.js
'use strict';

const { configs } = require('@nullvoxpopuli/eslint-configs');
const { baseConfig } = require('@nullvoxpopuli/eslint-configs/configs/node');

const mjs = configs.nodeES();

module.exports = {
  ...mjs,
};

'use strict';

module.exports = {
  transform: {
    '\\.[jt]s?$': 'babel-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!(lowlight|fault))'],
  testRegex: ['\\.test\\.cjs'],
  moduleFileExtensions: ['js', 'cjs'],
};

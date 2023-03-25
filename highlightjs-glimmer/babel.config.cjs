'use strict';

/**
 * used only for jest, because apparently we can't have
 * nice things when testing node
 */
module.exports = {
  env: {
    test: {
      plugins: [
        [
          require('@babel/plugin-transform-modules-commonjs'),
          {
            importInterop: 'babel',
          },
        ],
      ],
    },
  },
};

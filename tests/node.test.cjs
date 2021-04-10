'use strict';

// TODO: we need hilgiht.js v11 to be published in order to do this test properly
const { hljs } = require('../../vendor/highlight.cjs');
const { glimmer } = require('../../dist/glimmer.cjs');

hljs.registerLanguage('glimmer', glimmer);

function parse(code) {
  return hljs.highlight(code, { language:  'glimmer' }).value;
}

describe('NodeJS // require', () => {
  test('it works', () => {
    expect(parse('<A />')).toEqual(`<span class="hljs-tag">&lt;<span class="hljs-title">A</span> /&gt;</span>`);
  });
})



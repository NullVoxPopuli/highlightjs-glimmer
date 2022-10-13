'use strict';

const path = require('path');

const top = path.join(__dirname, '../..');

const hljs = require('highlight.js');

const { glimmer } = require(`${top}/dist/glimmer.cjs`);

hljs.registerLanguage('glimmer', glimmer);

function parse(code) {
  return hljs.highlight(code, { language: 'glimmer' }).value;
}

describe('NodeJS // require', () => {
  test('it works', () => {
    expect(parse('<A />')).toEqual(
      `<span class="hljs-tag">&lt;<span class="hljs-title">A</span> /&gt;</span>`
    );
  });
});

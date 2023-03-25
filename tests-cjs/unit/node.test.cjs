/* globals describe, it, expect */
'use strict';

const hljs = require('highlight.js');

const { glimmer } = require(`highlightjs-glimmer`);

hljs.registerLanguage('glimmer', glimmer);

function parse(code) {
  return hljs.highlight(code, { language: 'glimmer' }).value;
}

describe('NodeJS // require', () => {
  it('works', () => {
    expect(parse('<A />')).toEqual(
      `<span class="hljs-tag">&lt;<span class="hljs-title">A</span> /&gt;</span>`
    );
  });
});

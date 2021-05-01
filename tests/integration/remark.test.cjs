'use strict';

const { stripIndent } = require('common-tags');
const unified = require('unified');
const markdown = require('remark-parse');
const html = require('remark-html');
const highlight = require('remark-highlight.js');
const hljs = require('highlight.js');

const { tag } = require('../-utils');

const { setup } = require('../../dist/glimmer.cjs.cjs');

setup(hljs);

function parse(text) {
  return unified().use(markdown).use(highlight).use(html).processSync(text).toString();
}

describe('Remark', () => {
  xit('works', async () => {
    expect(
      parse(stripIndent`
      \`\`\`glimmer
        {{@arg}}
      \`\`\`
      `)
    ).toEqual(
      '<pre><code class="hljs language-glimmer">' +
        tag('punctuation mustache', ['{{', tag('punctuation', '@'), tag('params', 'arg'), '}}']) +
        '</code></pre>'
    );
  });
});

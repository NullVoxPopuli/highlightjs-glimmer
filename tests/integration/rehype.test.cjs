'use strict';

const { stripIndent } = require('common-tags');
const markdown = require('remark-parse');
const remark2rehype = require('remark-rehype');
const highlight = require('rehype-highlight');
const html = require('rehype-stringify');

const { externalSetup } = require('../../dist/glimmer.cjs.cjs');
const { tag } = require('../-utils');

function parse(text) {
  return rehype()
    .data('settings', { fragment: true })
    .use(markdown)
    .use(remark2rehype)
    .use(highlight, {
      languages: {
        // js: require('highlight.js/lib/languages/javascript'),
        glimmer: externalSetup,
      },
    })
    .use(html)
    .processSync(text)
    .toString();
}

describe('Rehype', () => {
  xit('works', async () => {
    expect(
      parse(stripIndent`
      \`\`\`hbs
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

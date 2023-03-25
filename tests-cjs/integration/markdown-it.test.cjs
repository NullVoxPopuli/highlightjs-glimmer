/* globals describe, it, expect */
const { stripIndent } = require('common-tags');
const markdownIt = require('markdown-it');

const hljs = require('highlight.js');

const { setup } = require('highlightjs-glimmer');

const { tag } = require('../-utils');

setup(hljs);

const md = markdownIt({
  html: true,
  highlight: (str, lang) => {
    return hljs.highlight(str, { language: lang }).value;
  },
});

describe('markdownIt', () => {
  it('works', async () => {
    expect(
      md.render(stripIndent`
        \`\`\`glimmer
          {{@arg}}
        \`\`\`
      `)
    ).toEqual(
      '<pre><code class="language-glimmer">  ' +
        tag('punctuation mustache', ['{{', tag('punctuation', '@'), tag('params', 'arg'), '}}']) +
        '\n' +
        '</code></pre>\n'
    );
  });
});

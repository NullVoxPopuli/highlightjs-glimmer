'use strict';

import { describe, it, expect } from 'vitest';

import { rehype } from 'rehype';
import { stripIndent } from 'common-tags';
import markdown from 'remark-parse';
import remark2rehype from 'remark-rehype';
import highlight from 'rehype-highlight';
import html from 'rehype-stringify';

import { glimmer } from 'highlightjs-glimmer';
import { tag } from '../-utils';

function parse(text) {
  return rehype()
    .data('settings', { fragment: true })
    .use(markdown)
    .use(remark2rehype)
    .use(highlight, {
      aliases: { hbs: 'glimmer', handlebars: 'glimmer' },
      languages: {
        // js: require('highlight.js/lib/languages/javascript'),
        glimmer,
      },
    })
    .use(html)
    .processSync(text)
    .toString();
}

describe('Rehype', () => {
  it('works', async () => {
    expect(
      parse(stripIndent`
      \`\`\`hbs
        {{@arg}}
      \`\`\`
      `)
    ).toEqual(
      '<pre><code class="hljs language-glimmer">  ' +
        tag('punctuation mustache', ['{{', tag('punctuation', '@'), tag('params', 'arg'), '}}']) +
        '\n' +
        '</code></pre>'
    );
  });
});

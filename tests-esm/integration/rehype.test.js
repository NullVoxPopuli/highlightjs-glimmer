'use strict';

import { stripIndent } from 'common-tags';
import { externalSetup } from 'highlightjs-glimmer';
import { rehype } from 'rehype';
import highlight from 'rehype-highlight';
import html from 'rehype-stringify';
import markdown from 'remark-parse';
import remark2rehype from 'remark-rehype';
import { describe, expect, it } from 'vitest';

import { tag } from '../-utils.js';

function parse(text) {
  return rehype()
    .data('settings', { fragment: true })
    .use(markdown)
    .use(remark2rehype)
    .use(highlight, {
      aliases: { hbs: 'glimmer', handlebars: 'glimmer' },
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
  it('works', async () => {
    expect(
      parse(stripIndent`
      \`\`\`glimmer
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

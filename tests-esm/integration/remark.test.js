'use strict';

import { describe, it, expect } from 'vitest';

import { stripIndent } from 'common-tags';
import { unified } from 'unified';
import markdown from 'remark-parse';
import html from 'remark-html';
import highlight from 'rehype-highlight';
import hljs from 'highlight.js';

import { setup, glimmer } from 'highlightjs-glimmer';

import { tag } from '../-utils';

setup(hljs);

function parse(text) {
  return unified()
    .use(markdown)
    .use(highlight, {
      languages: { glimmer },
      aliases: { hbs: 'glimmer', handlebars: 'glimmer' },
    })
    .use(html)
    .processSync(text)
    .toString();
}

describe('Remark', () => {
  it('works', async () => {
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

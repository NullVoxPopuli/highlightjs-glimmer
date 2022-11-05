import { describe, it, expect } from 'vitest';

import hljs from 'highlight.js';
import { stripIndent } from 'common-tags';
import markdownIt from 'markdown-it';
import { setup } from 'highlightjs-glimmer';

import { tag } from '../-utils';

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

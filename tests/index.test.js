import { stripIndent } from 'common-tags';
import { parse, tag } from './-utils';

describe('Component Invocation', () => {
  test('self-closed', () => {
    expect(parse('<Component::Name />')).toEqual(
      `${tag('tag', ['&lt;', tag('title', ['Component']), '::', tag('title', ['Name']), ' /&gt;'])}`
    );
  });

  test('block, no args', () => {
    expect(
      parse(stripIndent`
      <Component>
        body
      </Component>
      `)
    ).toEqual(
      stripIndent`
        <span class="hljs-tag">&lt;<span class="hljs-title">Component</span>&gt;</span>
          body
        <span class="hljs-tag">&lt;/<span class="hljs-title">Component</span>&gt;</span>
      `
    );
  });
});

describe('Expressions', () => {
  describe('Mustache', () => {
    test('this.property', () => {
      let result = parse('{{this.property}}');

      expect(result).toEqual(
        stripIndent`
          <span class="hljs-punctuation mustache">{{<span class="hljs-class">this</span><span class="hljs-punctuation">.</span><span class="hljs-property">property</span>}}</span>
        `
      );
    });
  });
});

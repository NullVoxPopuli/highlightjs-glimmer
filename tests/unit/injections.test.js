import { describe, test, expect } from 'vitest';
import { stripIndent } from 'common-tags';
import { parse, tag } from '../-utils';

describe('Injections | JS', () => {
  describe('hbs template literal', () => {
    test('basic', () => {
      let result = parse(
        stripIndent`
          const hbs\`{{foo}}\`
        `,
        'js'
      );

      expect(result).toEqual(
        '<span class="hljs-keyword">const</span> hbs<span class="hljs-string">`{{foo}}`</span>'
      );
    });
  });

  describe('gjs / template tag', () => {
    test('basic', () => {
      let result = parse(
        stripIndent`
          export const Name = <template>
            {{@name}}
          </template>;
        `,
        'js'
      );

      expect(result).toEqual(
        stripIndent`
          <span class="hljs-keyword">export</span> <span class="hljs-keyword">const</span> <span class="hljs-title class_">Name</span> = <span class="language-xml"><span class="hljs-tag">&lt;<span class="hljs-name">template</span>&gt;</span>
            {{@name}}
          <span class="hljs-tag">&lt;/<span class="hljs-name">template</span>&gt;</span></span>;
        `
      );
    });
  });
});

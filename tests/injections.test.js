import { parse, tag } from './-utils';

describe('Injections | JS', () => {
  test('basic', () => {
    expect(parse('const hbs`{{foo}}`', 'js')).toEqual(
      '<span class="hljs-keyword">const</span> hbs<span class="hljs-string">`{{foo}}`</span>'
    );
  });
});

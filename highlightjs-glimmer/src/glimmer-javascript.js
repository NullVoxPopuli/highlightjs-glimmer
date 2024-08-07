const CSS_RULE_BEGIN = [
  'css`', // hljs <= 11.9.0
  '.?css`', // hljs >= 11.10.0
];

function buildHbsLiteralRule(hljs, js) {
  const rawJs = js.rawDefinition(hljs);
  const css = rawJs.contains.find((rule) => CSS_RULE_BEGIN.includes(rule?.begin));

  const rule = hljs.inherit(css, { begin: /hbs`/ });

  rule.starts.subLanguage = 'glimmer';

  return rule;
}

/**
 * A lot of this is stolen from XML
 */
const GLIMMER_TEMPLATE_TAG = {
  begin: /<template>/,
  end: /<\/template>/,
  /**
   * @param {RegExpMatchArray} match
   * @param {CallbackResponse} response
   */
  isTrulyOpeningTag: (match, response) => {
    const afterMatchIndex = match[0].length + match.index;
    const nextChar = match.input[afterMatchIndex];

    if (
      // HTML should not include another raw `<` inside a tag
      // nested type?
      // `<Array<Array<number>>`, etc.
      nextChar === '<' ||
      // the , gives away that this is not HTML
      // `<T, A extends keyof T, V>`
      nextChar === ','
    ) {
      response.ignoreMatch();

      return;
    }

    // `<something>`
    // Quite possibly a tag, lets look for a matching closing tag...
    // if (nextChar === '>') {
    //   // if we cannot find a matching closing tag, then we
    //   // will ignore it
    //   if (!hasClosingTag(match, { after: afterMatchIndex })) {
    //     response.ignoreMatch();
    //   }
    // }

    // `<blah />` (self-closing)
    // handled by simpleSelfClosing rule

    // `<From extends string>`
    // technically this could be HTML, but it smells like a type
    let m;
    const afterMatch = match.input.substring(afterMatchIndex);

    // NOTE: This is ugh, but added specifically for https://github.com/highlightjs/highlight.js/issues/3276
    if ((m = afterMatch.match(/^\s+extends\s+/))) {
      if (m.index === 0) {
        response.ignoreMatch();

        // eslint-disable-next-line no-useless-return
        return;
      }
    }
  },
};

const GLIMMER_TEMPLATE_TAG_RULE = {
  variants: [
    {
      begin: GLIMMER_TEMPLATE_TAG.begin,
      // we carefully check the opening tag to see if it truly
      // is a tag and not a false positive
      'on:begin': GLIMMER_TEMPLATE_TAG.isTrulyOpeningTag,
      end: GLIMMER_TEMPLATE_TAG.end,
    },
  ],
  subLanguage: 'glimmer',
  contains: [
    {
      begin: GLIMMER_TEMPLATE_TAG.begin,
      end: GLIMMER_TEMPLATE_TAG.end,
      skip: true,
      contains: ['self'],
    },
  ],
};

export default function glimmerJavascript(hljs, jsLanguageName = 'javascript') {
  const js = hljs.getLanguage(jsLanguageName);

  if (!js) {
    console.warn(`JavaScript grammar not loaded. Cannot initialize glimmerJavascript.`);

    return;
  }

  return {
    name: 'glimmer-javascript',
    aliases: ['glimmer-js', 'gjs'],
    subLanguage: jsLanguageName,
    contains: [GLIMMER_TEMPLATE_TAG_RULE, buildHbsLiteralRule(hljs, js)],
  };
}

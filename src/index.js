import _glimmer from './glimmer.js';

export const glimmer = _glimmer;

export function setup(hljs) {
  registerLanguage(hljs);
  registerInjections(hljs);
}

export function externalSetup(hljs) {
  let grammar = _glimmer(hljs);

  registerInjections(hljs);

  return grammar;
}

export function registerLanguage(hljs) {
  return hljs.registerLanguage('glimmer', _glimmer);
}

export function registerInjections(hljs) {
  registerJavaScriptInjections(hljs);
}

function registerJavaScriptInjections(hljs) {
  let js = hljs.getLanguage('javascript');

  if (!js) {
    console.warn(`JavaScript grammar not loaded`);

    return;
  }

  js = js.rawDefinition(hljs);

  setupHBSLiteral(hljs, js);
  swapXMLForGlimmer(hljs, js);
  setupTemplateTag(hljs, js);

  hljs.registerLanguage('javascript', () => js);
  hljs.registerLanguage('glimmer-javascript', () => js);
}

function setupHBSLiteral(hljs, js) {
  let cssIndex = js.contains.findIndex((rule) => rule?.begin === 'css`');
  let css = js.contains[cssIndex];

  const HBS_TEMPLATE = hljs.inherit(css, { begin: /hbs`/ });

  HBS_TEMPLATE.starts.subLanguage = 'glimmer';

  js.contains.splice(cssIndex, 0, HBS_TEMPLATE);
}

function swapXMLForGlimmer(_hljs, js) {
  // The default JSX grammar is actually just XML, which... is also wrong :D
  js.contains
    .flatMap((contains) => contains?.contains || contains)
    .filter((rule) => rule.subLanguage === 'xml')
    .forEach((rule) => (rule.subLanguage = 'glimmer'));
}

/**
 * A lot of this is stolen from XML
 */
function setupTemplateTag(_hljs, js) {
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
      if (nextChar === '>') {
        // if we cannot find a matching closing tag, then we
        // will ignore it
        if (!hasClosingTag(match, { after: afterMatchIndex })) {
          response.ignoreMatch();
        }
      }

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

  js.contains.unshift({
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
  });
}

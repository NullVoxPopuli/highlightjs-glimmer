import _glimmer from './glimmer.js';

export const glimmer = _glimmer;

export function setup(hljs) {
  registerLanguage(hljs);
  registerInjections(hljs);
}

export function registerLanguage(hljs) {
  hljs.registerLanguage('glimmer', _glimmer);
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

  let cssIndex = js.contains.findIndex((rule) => rule?.begin === 'css`');
  let css = js.contains[cssIndex];

  // The default JSX grammar is actually just XML, which... is also wrong :D
  js.contains
    .flatMap((contains) => contains?.contains || contains)
    .filter((rule) => rule.subLanguage === 'xml')
    .forEach((rule) => (rule.subLanguage = 'glimmer'));

  const HBS_TEMPLATE = hljs.inherit(css, { begin: /hbs`/ });

  HBS_TEMPLATE.starts.subLanguage = 'glimmer';
  js.contains.splice(cssIndex, 0, HBS_TEMPLATE);
  hljs.registerLanguage('javascript', () => js);
}

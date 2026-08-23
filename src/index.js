import _glimmer from './glimmer.js';
import _glimmerJavascript from './glimmer-javascript.js';

export const glimmer = _glimmer;
export const glimmerJavascript = _glimmerJavascript;

/**
 * The convenience method for configuring everything related to
 * glimmer highlighting. This wraps `registerLanguage` and `registerInjections`.
 * For most use cases, this should be the only method you need.
 */
export function setup(hljs) {
  registerLanguage(hljs);
  registerInjections(hljs);
}

export function externalSetup(hljs) {
  let grammar = _glimmer(hljs);

  registerInjections(hljs);

  return grammar;
}

/**
 * Convenience method for registering the glimmer template syntax with
 * highlight.js under the name "glimmer"
 */
export function registerLanguage(hljs) {
  return hljs.registerLanguage('glimmer', _glimmer);
}

/**
 * Registers the glimmer-javascript grammar, and installes `javascript`,
 * `js`, `mjs` and `cjs` as aliases of it
 */
export function registerInjections(hljs) {
  registerGlimmerJsWithJsOverrides(hljs);
}

function registerGlimmerJsWithJsOverrides(hljs) {
  const newJsLanguageName = '_js-in-gjs';

  // Rename original language so that we can still use it
  let js = hljs.getLanguage('javascript');

  hljs.registerLanguage(newJsLanguageName, (hljs) => js.rawDefinition(hljs));
  hljs.unregisterLanguage('javascript');

  hljs.registerLanguage('glimmer-javascript', (hljs) => {
    const definition = glimmerJavascript(hljs, newJsLanguageName);

    definition.aliases.push('javascript', 'js', 'mjs', 'cjs', 'mjs');

    return definition;
  });
}

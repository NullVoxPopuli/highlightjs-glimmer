import _glimmer from './glimmer';

export const glimmer = _glimmer;

export function registerLanguage(hljs) {
  hljs.registerLanguage('glimmer', _glimmer);
}

// function registerInjections(hljs) {
//   throw new Error('Not implemented yet');
// }

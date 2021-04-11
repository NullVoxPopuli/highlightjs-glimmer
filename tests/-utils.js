// NOTE: this highlight.js was manually built and had an export manually added
//       This is because the glimmer syntax requires a to-be-released
//       version of highlight.js at the time of writing
import { hljs } from '../vendor/highlight';
import { registerLanguage } from '../src';

registerLanguage(hljs);

export function parse(code) {
  return hljs.highlight(code, { language: 'glimmer' }).value;
}

export function tag(klass, children = []) {
  return `<span class="hljs-${klass}">${children.join('')}</span>`;
}

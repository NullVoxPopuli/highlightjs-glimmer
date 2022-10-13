// NOTE: this highlight.js was manually built and had an export manually added
//       This is because the glimmer syntax requires a to-be-released
//       version of highlight.js at the time of writing
import hljs from 'highlight.js';
import { registerLanguage } from 'highlightjs-glimmer';

registerLanguage(hljs);

export function parse(code, lang = 'glimmer') {
  return hljs.highlight(code, { language: lang }).value;
}

export function tag(klass, children = []) {
  let _children = Array.isArray(children) ? children : [children];

  return `<span class="hljs-${klass}">${_children.join('')}</span>`;
}

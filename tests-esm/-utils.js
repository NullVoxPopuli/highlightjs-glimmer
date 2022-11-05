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

export function list(children) {
  return children.join('');
}

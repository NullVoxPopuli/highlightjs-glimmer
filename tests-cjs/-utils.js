const hljs = require('highlight.js');
const { registerLanguage } = require('highlightjs-glimmer');

registerLanguage(hljs);

function parse(code, lang = 'glimmer') {
  return hljs.highlight(code, { language: lang }).value;
}

function tag(klass, children = []) {
  let _children = Array.isArray(children) ? children : [children];

  return `<span class="hljs-${klass}">${_children.join('')}</span>`;
}

module.exports = { parse, tag };

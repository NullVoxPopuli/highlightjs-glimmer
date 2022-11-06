import { expect } from 'vitest';
import hljs from 'highlight.js';
import { setup } from 'highlightjs-glimmer';

setup(hljs);

import prettier from 'prettier';

// Used to resolve indentation issues.
// We don't care about that in these tests -- we only care about tag identification.
export function format(code) {
  return prettier.format(code, { parser: 'html', htmlWhitespaceSensitivity: 'ignore' });
}

export function formattedEquals(actual, expected) {
  expect(format(actual)).toEqual(format(expected));
}

export function parse(code, lang = 'glimmer') {
  return hljs.highlight(code, { language: lang }).value;
}

export function glimmer(...children) {
  return `<span class="language-glimmer">${children.join('')}</span>`;
}

export const templateTags = {
  get begin() {
    return tag('tag', ['&lt;', tag('title', 'template'), '&gt;']);
  },
  get end() {
    return tag('tag', ['&lt;/', tag('title', 'template'), '&gt;']);
  },
};

export function template(...content) {
  return list(templateTags.begin, '\n', ...indentLines(content), '\n', templateTags.end);
}

export function selfClosing(name, attributes = []) {
  return tag('tag', ['&lt;', tag('title', name), ...attributes, ' /&gt;']);
}

export function indentLines(lines, amount = 2) {
  let indent = Array(amount + 1).join(' ');

  return lines.map((line) => {
    return `${indent}${line}`;
  });
}

export function element(name, content = []) {
  return list(
    tag('tag', ['&lt;', tag('title', name), '&gt;']),
    '\n',
    ...indentLines(content),
    '\n',
    tag('tag', ['&lt;/', tag('title', name), '&gt;'])
  );
}

export function mustache(...content) {
  return tag('punctuation mustache', ['{{', ...content, '}}']);
}

export function arg(name) {
  return list(tag('punctuation', '@'), tag('params', name));
}

export const keyword = {
  export: tag('keyword', 'export'),
  const: tag('keyword', 'const'),
  default: tag('keyword', 'default'),
};

export const operator = {
  equals: tag('operator', '='),
};

export function string(content) {
  return tag('string', ['&quot;', content, '&quot;']);
}

export const tags = {
  template,
  mustache,
  element,
  selfClosing,
  arg,
  keyword,
  operator,
  string,
};

export function tag(klass, children = []) {
  let _children = Array.isArray(children) ? children : [children];

  return `<span class="hljs-${klass}">${_children.join('')}</span>`;
}

export function list(...children) {
  return children.join('');
}

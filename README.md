# highlightjs-glimmer

[![npm version](https://badge.fury.io/js/highlightjs-glimmer.svg)](https://www.npmjs.com/package/highlightjs-glimmer)
[![code quality](https://badgen.net/lgtm/grade/github/NullVoxPopuli/highlightjs-glimmer/js?label=code+quality)](https://lgtm.com/projects/g/NullVoxPopuli/highlightjs-glimmer/)

glimmer syntax highlighting with [highlight.js](https://github.com/highlightjs/highlight.js)

## Install

```bash
yarn add highlightjs-glimmer
# or
npm install highlightjs-glimmer
```

Requires: [highlight.js >= v11](https://github.com/highlightjs/highlight.js)

## Usage

```js
import hljs from 'highlight.js';
import { setup } from 'highlightjs-glimmer';

setup(hljs);

hljs.highlightAll();
```

 - the `javascript` language must be registered before `setup` is called.
 - `setup` _must_ be called before any highlighting occurs.

Supported language tags:

```html
<pre>
  <code class="language-{tag}">
```
where `{tag}` could be:
 - glimmer
 - hbs
 - html.hbs
 - html.handlebars
 - htmlbars

**NOTE** because highlightjs-glimmer overrides the same aliases as highlightjs' handlebars grammar,
to use the handlebars grammar align with the glimmer grammar, you'll need to use the full name in class
```html
<pre><code class="lang-glimmer">...</code></pre>
<pre><code class="lang-handlebars">...</code></pre>
```

## with `await import(...)`

When using ES Modules in browsers with a packager

```ts
let HIGHLIGHT;

async function getHighlighter() {
  if (HIGHLIGHT) return HIGHLIGHT;

  HIGHLIGHT = (await import('highlight.js')).default;

  let { setup } = await import('highlightjs-glimmer');

  setup(HIGHLIGHT);

  return HIGHLIGHT;
}


async highlight() {
  let hljs = await getHighlighter();

  let element = document.querySelector('...');

  hljs.highlightElement(element);
}

highlight();
```

## API

- `setup`

    The convenience method for configuring everything related to
    glimmer highlighting. This wraps `registerLanguage` and `registerInjections`.
    For most use cases, this should be the only method you need.

- `registerLanguage`

    Convenience method for registering the glimmer syntax with
    highlight.js under the name "glimmer"

- `registerInjections`

    Configures injections in supported languages where it's common to use glimmer
    syntax.

- `glimmer`

    The highlight.js grammar function. This can be used to register
    the glimmer grammar under a name other than "glimmer".

## CDN Usage

### Traditional Script Tags

```html
<script type="text/javascript" src="/cdn/path/to/highlight.min.js"></script>
<script type="text/javascript" src="/cdn/path/to/highlightjs-glimmer/glimmer.js"></script>
<script type="text/javascript">hljs.highlightAll();</script>
```

### ES Modules

At this time, highlight.js does not ship ES Modules to CDNs

```html
<script type="text/javascript" src="/cdn/path/to/highlight.min.js"></script>
<script type="module">
  import { glimmer } from '/cdn/path/to/highlightjs-glimmer/glimmer.esm.js';

  hljs.registerLanguage('glimmer', glimmer);
  hljs.highlightAll();
</script>
```

## Node / cjs / `require`

```js
const hljs = require('highlight.js');
const { setup } = require('highlightjs-glimmer');

setup(hljs);

hljs.highlightAll();
```

Only Node 14 is supported

## Node ES Modules / `import`

```js
import hljs from 'highlight.js';
import { setup } from 'highlightjs-glimmer';

setup(hljs);

hljs.highlightAll();
```

With Node 14, launch with

```bash
NODE_OPTIONS="--experimental-vm-modules" node your-module-script.js
```

## Contributing

Debug with `yarn debug -p 4201`
Visit `http://localhost:4201`

Run Tets with `yarn test` or `npm run test`

# highlightjs-glimmer

glimmer syntax highlighting with highlight.js

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
import { glimmer } from 'highlightjs-glimmer';

hljs.registerLanguage('glimmer', glimmer);
hljs.highlightAll();
```

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

**NOTE** highlightjs-glimmer cannot be used at the same time as highlightjs' handlebars syntax highlighting.

## HTML via CDN

```html
<script type="text/javascript" src="/cdn/path/to/highlight.min.js"></script>
<script type="text/javascript" src="/cdn/path/to/highlightjs-glimmer/glimmer.js"></script>
<script type="text/javascript">hljs.highlightAll();</script>
```

## HTML via ES Modules

```html
<script type="text/javascript" src="/cdn/path/to/highlight.min.js"></script>
<script type="module">
  import { glimmer } from '/cdn/path/to/highlightjs-glimmer/glimmer.esm.js';

  hljs.registerLanguage('glimmer', glimmer);
  hljs.highlightAll();
</script>
```

## Contributing

Debug with `npx html-pages . -p 4201`
Visit `http://10.0.2.15:4201`

Run Tets with `yarn test` or `npm run test`

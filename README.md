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

## Contributing

Debug with `npx html-pages . -p 4201`
Visit `http://10.0.2.15:4201`

Run Tets with `yarn test` or `npm run test`

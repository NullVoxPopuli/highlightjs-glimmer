---
'highlightjs-glimmer': minor
---

Previously, this package enabled glimmer-js support by patching into the official highlightjs javascript grammar. This is problematic if you want to support both gjs and js(/jsx) syntax highlighting alongside each other.

This change refactors things so that glimmer-javascript is defined and exported as a standalone grammar. Instead of patching the standard javascript grammar, it uses the `subLanguage` feature to extend it cleanly. hbs-literal and template-tag support are added via additional 'contains' rules.

To maintain the existing 'override javascript grammar' behavior for existing consumers of this package, the setup APIs will unregister the default `javascript` grammar, and register `javascript`, `js`, `mjs` and `cjs` as aliases of the new `glimmer-javascript` grammar. Consumers who want to take advantage of the standalone grammar can import it and register using the standard `hljs.registerLanguage` technique.

For example:

```js
import hljs from 'highlight.js';
import { glimmerJavascript } from 'highlightjs-glimmer';

// 'javascript' must also be registered prior to running this
hljs.registerLanguage('glimmer-javascript', glimmerJavascript);
```

The old usage, `setup` and other methods,

```js
import hljs from 'highlight.js';
import { setup } from 'highlightjs-glimmer';

setup(hljs);

hljs.highlightAll();
```

Have been unchanged in this release, but are likely to change in the next major so that the default / recommended APIs don't take away from the possibility of using other languages in the same document.

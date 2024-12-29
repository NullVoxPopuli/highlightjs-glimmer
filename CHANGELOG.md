# highlightjs-glimmer

## 2.2.2

### Patch Changes

- [#476](https://github.com/NullVoxPopuli/highlightjs-glimmer/pull/476) [`c6bf513`](https://github.com/NullVoxPopuli/highlightjs-glimmer/commit/c6bf513ebc75cc72eb43e0ecfc578e25aec90d8e) Thanks [@davidtaylorhq](https://github.com/davidtaylorhq)! - Fix compatibility with highlight-js 11.10.0

## 2.2.1

### Patch Changes

- [#429](https://github.com/NullVoxPopuli/highlightjs-glimmer/pull/429) [`263c15b`](https://github.com/NullVoxPopuli/highlightjs-glimmer/commit/263c15bdea067783144569b544e277f7ef74f05b) Thanks [@davidtaylorhq](https://github.com/davidtaylorhq)! - Declare support for Node 20

## 2.2.0

### Minor Changes

- [#425](https://github.com/NullVoxPopuli/highlightjs-glimmer/pull/425) [`3f3447a`](https://github.com/NullVoxPopuli/highlightjs-glimmer/commit/3f3447a18f7ff965dda95f991f1dd11ecd33fb26) Thanks [@davidtaylorhq](https://github.com/davidtaylorhq)! - Previously, this package enabled glimmer-js support by patching into the official highlightjs javascript grammar. This is problematic if you want to support both gjs and js(/jsx) syntax highlighting alongside each other.

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

## 2.1.0

### Minor Changes

- [#335](https://github.com/NullVoxPopuli/highlightjs-glimmer/pull/335) [`c5a9256`](https://github.com/NullVoxPopuli/highlightjs-glimmer/commit/c5a925651f3237734135dab3ef5b633d6d54fd9b) Thanks [@NullVoxPopuli](https://github.com/NullVoxPopuli)! - Support <style> tags

### Patch Changes

- [#256](https://github.com/NullVoxPopuli/highlightjs-glimmer/pull/256) [`def7bb5`](https://github.com/NullVoxPopuli/highlightjs-glimmer/commit/def7bb5e17b9296b275eabef72baffb7f1bfe30b) Thanks [@NullVoxPopuli](https://github.com/NullVoxPopuli)! - Removed some unused code.

## [2.0.1](https://github.com/NullVoxPopuli/highlightjs-glimmer/compare/v2.0.0...v2.0.1) (2022-11-06)

### Bug Fixes

- **gjs:** consistently highlight gjs blocks ([abfdd2b](https://github.com/NullVoxPopuli/highlightjs-glimmer/commit/abfdd2bfa36d02c65981bf01042cee1f71d08060))
- **template:** use more robust template tag identification ([b6f3e05](https://github.com/NullVoxPopuli/highlightjs-glimmer/commit/b6f3e05063fb040e3d157d64d336b08e48e70515))

# [2.0.0](https://github.com/NullVoxPopuli/highlightjs-glimmer/compare/v1.4.1...v2.0.0) (2022-11-05)

### chore

- drop support for node < 14 ([18fd5b2](https://github.com/NullVoxPopuli/highlightjs-glimmer/commit/18fd5b24c64c49a8d68cd22a6c152cef14da2542))

### BREAKING CHANGES

- drop support for node < 14

## [1.4.1](https://github.com/NullVoxPopuli/highlightjs-glimmer/compare/v1.4.0...v1.4.1) (2021-12-26)

### Bug Fixes

- **support:** widen highlight.js peerDep ([86e3b83](https://github.com/NullVoxPopuli/highlightjs-glimmer/commit/86e3b83230d0aa5bf79d2e7f219cbb725af769d9))

# [1.4.0](https://github.com/NullVoxPopuli/highlightjs-glimmer/compare/v1.3.4...v1.4.0) (2021-05-01)

### Features

- **internal:** setup CJS testing with remark and rehype ([631af9d](https://github.com/NullVoxPopuli/highlightjs-glimmer/commit/631af9d1c3ee09644acc7151e26586b399ab0ca2))

## [1.3.4](https://github.com/NullVoxPopuli/highlightjs-glimmer/compare/v1.3.3...v1.3.4) (2021-04-30)

### Bug Fixes

- **dist:** rename cjs output to end in cjs extension ([1c20168](https://github.com/NullVoxPopuli/highlightjs-glimmer/commit/1c201682fb769bce5040817ffd1119993ef0734b))

## [1.3.3](https://github.com/NullVoxPopuli/highlightjs-glimmer/compare/v1.3.2...v1.3.3) (2021-04-13)

### Bug Fixes

- **grammar:** this.property is now [class][punc][property] ([9492542](https://github.com/NullVoxPopuli/highlightjs-glimmer/commit/94925427ee10613e75b4239abcc0ed679f416e40))

## [1.3.2](https://github.com/NullVoxPopuli/highlightjs-glimmer/compare/v1.3.1...v1.3.2) (2021-04-11)

### Bug Fixes

- **colors:** punctuation fix for curlies ([29d295f](https://github.com/NullVoxPopuli/highlightjs-glimmer/commit/29d295ffe16e5aabfc32bc351414f089b7a10b7b))

## [1.3.1](https://github.com/NullVoxPopuli/highlightjs-glimmer/compare/v1.3.0...v1.3.1) (2021-04-11)

### Bug Fixes

- **colors:** fix issues with punctuation, this, operator, and mustache ([ddacc29](https://github.com/NullVoxPopuli/highlightjs-glimmer/commit/ddacc293ca64b64ff33e0a415a08337a86fc106a))

# [1.3.0](https://github.com/NullVoxPopuli/highlightjs-glimmer/compare/v1.2.0...v1.3.0) (2021-04-11)

### Features

- **grammar:** support template tags in js ([c0517f5](https://github.com/NullVoxPopuli/highlightjs-glimmer/commit/c0517f5c74a6d00a33090133b38a9a66cace1dca))

# [1.2.0](https://github.com/NullVoxPopuli/highlightjs-glimmer/compare/v1.1.1...v1.2.0) (2021-04-11)

### Features

- **syntax:** hbs template literal support in JS ([0e35950](https://github.com/NullVoxPopuli/highlightjs-glimmer/commit/0e359503853964894f23b44a118724ecc1e5a627))

## [1.1.1](https://github.com/NullVoxPopuli/highlightjs-glimmer/compare/v1.1.0...v1.1.1) (2021-04-11)

### Bug Fixes

- **tests:** hljs tests now includes glimmer ([a0d12d8](https://github.com/NullVoxPopuli/highlightjs-glimmer/commit/a0d12d8fd44ba419a61f749b28a3c38c81a7e4b0))

# [1.1.0](https://github.com/NullVoxPopuli/highlightjs-glimmer/compare/v1.0.1...v1.1.0) (2021-04-10)

### Features

- setup CDN support ([fb940cd](https://github.com/NullVoxPopuli/highlightjs-glimmer/commit/fb940cda950798b6a49fbf6ae6dee8f439abbc16))

## [1.0.1](https://github.com/NullVoxPopuli/highlightjs-glimmer/compare/v1.0.0...v1.0.1) (2021-04-06)

### Bug Fixes

- **internal:** update demo page and prep for GH pages ([55f49f4](https://github.com/NullVoxPopuli/highlightjs-glimmer/commit/55f49f450fc97c081d18e6d2d93778b28cae946e))

# 1.0.0 (2021-04-06)

### Bug Fixes

- **internal:** ci config ([ce5270e](https://github.com/NullVoxPopuli/highlightjs-glimmer/commit/ce5270ee2c5df477efe6cfabd7c5f3b69450e356))
- add tests ([422d379](https://github.com/NullVoxPopuli/highlightjs-glimmer/commit/422d3793a72a3d3b0c102692cbb3b3b6d9dec770))
- **internal:** setup linting ([92a6f81](https://github.com/NullVoxPopuli/highlightjs-glimmer/commit/92a6f81e516dc4fac85e271fd634334571f351a0))

### chore

- **readme:** declare minimum highlight.js version ([42e2275](https://github.com/NullVoxPopuli/highlightjs-glimmer/commit/42e22754df72feb42e44c3d7a7bfc5d1eb833f3b))

### BREAKING CHANGES

- **readme:** prep for release

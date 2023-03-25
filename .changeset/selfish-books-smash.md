---
"highlightjs-glimmer": patch
---

Fix issue where the `<template>` block in

```gjs
const demo = new Demo();

setTimeout(() => {
  demo.theProperty = 2;
}, 500);

<template>
  {{demo.theProperty}}
</tepmlate>
```

is unhighlighted.

Now it will be highlighted.

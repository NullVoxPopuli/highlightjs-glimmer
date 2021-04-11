#!/bin/bash

glimmer=$PWD
tmp_dir=$(mktemp -d -t ci-XXXXXXXXXX)
hljs="$tmp_dir/highlight.js"

set -eax

cd $tmp_dir
git clone https://github.com/highlightjs/highlight.js.git
cd $hljs

set +x

volta pin node@14
volta pin npm@7
export NODE_OPTIONS="--unhandled-rejections=strict"

echo ""
echo "  Node: $(node --version)"
echo "  PWD: $PWD"
echo ""

set -x

npm install
mkdir -p $hljs/extra/glimmer/src
# index.js is the "main", but we plan on exporting some helper functions
# since rollup has a weird way of representing default exports when
# named exports are also present, we have to move the file with the default
# export to the "main" location.
# so, this is not a real representation of the highlightjs-glimmer package
cp $glimmer/src/glimmer.js $hljs/extra/glimmer/src/index.js
cp $glimmer/package.json $hljs/extra/glimmer/package.json
node ./tools/build.js -t node

# we can only copy glimmer after the build, because
# hljs' rollup config does not permit both default and
# named exports
# ln -s $glimmer/dist/glimmer.cjs.js $hljs/build/lib/languages/glimmer.js

npm run test


#!/bin/bash

glimmer=$PWD
tmp_dir=$(mktemp -d -t ci-XXXXXXXXXX)
hljs="$tmp_dir/highlight.js"

function cleanup() {
  set +x

  echo ""
  echo "You can inspect the cloned hljs repo at"
  echo "    $hljs"
  echo ""
}

trap cleanup EXIT
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
mkdir -p $hljs/extra/glimmer/src/languages/
# index.js is the "main", but we plan on exporting some helper functions
# since rollup has a weird way of representing default exports when
# named exports are also present, we have to move the file with the default
# export to the "main" location.
# so, this is not a real representation of the highlightjs-glimmer package
cp $glimmer/src/glimmer.js $hljs/extra/glimmer/src/languages/glimmer.js

node ./tools/build.js -t node

npm run test



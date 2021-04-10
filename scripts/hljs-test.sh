#!/bin/bash

glimmer=$PWD
tmp_dir=$(mktemp -d -t ci-XXXXXXXXXX)
hljs="$tmp_dir/highlight.js"

set -eax

cd $tmp_dir
git clone https://github.com/highlightjs/highlight.js.git
cd "$hljs/extra"

ln -s "$glimmer/src" glimmer
cd $hljs

echo ""
echo "  Node: $(node --version)"
echo "  PWD: $PWD"
echo ""

volta pin node@14
volta pin npm@7

npm install

ONLY_EXTRA=true node ./tools/build.js -t node
npm run test

'use strict';

const path = require('path');
const esbuild = require('esbuild');

/**
 * CDN / script-only auto-registration
 */
esbuild.buildSync({
  entryPoints: [path.join(__dirname, 'cdn-bootstrap.js')],
  bundle: true,
  minify: true,
  format: 'iife',
  sourcemap: false,
  target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
  outfile: path.join(__dirname, '../dist/glimmer.min.js'),
});

/**
 * CDN / import
 */
esbuild.buildSync({
  entryPoints: [path.join(__dirname, '../src/glimmer.js')],
  bundle: false,
  minify: true,
  format: 'esm',
  sourcemap: false,
  target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
  outfile: path.join(__dirname, '../dist/glimmer.esm.min.js'),
});

/**
 * Node / require
 */
esbuild.buildSync({
  entryPoints: [path.join(__dirname, '../src/glimmer.js')],
  bundle: false,
  minify: false,
  format: 'cjs',
  sourcemap: false,
  outfile: path.join(__dirname, '../dist/glimmer.cjs.js'),
});

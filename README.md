# rollup-plugin-shim
[![NPM Package](https://badge.fury.io/js/rollup-plugin-shim.svg)](https://www.npmjs.com/package/rollup-plugin-shim)
[![Build Status](https://travis-ci.org/patrickhulce/rollup-plugin-shim.svg?branch=master)](https://travis-ci.org/patrickhulce/rollup-plugin-shim)
[![Coverage Status](https://coveralls.io/repos/github/patrickhulce/rollup-plugin-shim/badge.svg?branch=master)](https://coveralls.io/github/patrickhulce/rollup-plugin-shim?branch=master)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Dependencies](https://david-dm.org/patrickhulce/rollup-plugin-shim.svg)](https://david-dm.org/patrickhulce/rollup-plugin-shim)

Plugin for rollup to provide a shim implementation for a module. Replaces required dependencies with the specified string instead, especially useful for shimming small dev-time APIs with a big footprint you don't want in production (like [debug](https://www.npmjs.com/package/debug)). For larger fully functional implementations that you want to use a file for you might want to consider the [rollup-plugin-alias](https://www.npmjs.com/package/rollup-plugin-alias) package instead.

## Usage

### Install

`yarn add -D rollup-plugin-shim`

### Shim

**main.js**

```js
import {writeFileSync} from 'fs'
import debug from 'debug'
import {bigFunction} from './local-dep'

const log = debug('mypackage:main')
// ...
```

**rollup.config.js**

```js
import {join} from 'path'
import shim from 'rollup-plugin-shim'

export default {
  entry: 'main.js',
  plugins: [
    shim({
      // replace fs with a noop shim
      fs: `export function writeFileSync() { }`,
      // replace debug to return a noop function
      debug: `export default () => () => undefined`,
      // replace a local dependency with a noop
      // can also use './local-dep' as the key if that's the only way it's required
      [join(__dirname, 'src/local-dep')]: `export function bigFunction() { }`,
    }),
  ],
}
```

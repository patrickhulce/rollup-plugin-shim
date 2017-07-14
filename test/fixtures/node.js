const named = require('foo').named
const defaultA = require('bar')
const all = require('baz')

const depended = require('./node-dep.js').depended

module.exports = defaultA(named, all, depended)

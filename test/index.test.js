const fs = require('fs')
const path = require('path')
const expect = require('chai').expect
const rollup = require('rollup')
const commonjs = require('rollup-plugin-commonjs')
const shim = require('../lib')

const fixture = filePath => path.join(__dirname, `fixtures/${filePath}`)

describe('index.js', () => {
  describe('#shim', () => {
    it('should return a rollup plugin', () => {
      const plugin = shim()
      expect(plugin).to.have.property('resolveId').a('function')
      expect(plugin).to.have.property('load').a('function')
    })
  })

  describe('#shim.resolveId', () => {
    it('should ignore unspecified modules', () => {
      const plugin = shim({foo: 'hello'})
      expect(plugin.resolveId('missing')).to.equal(null)
    })

    it('should create an ID for specified modules', () => {
      const plugin = shim({foo: 'hello'})
      expect(plugin.resolveId('foo')).to.match(/rollup-plugin-shim-\d+/)
    })

    it('should create multiple ID for specified modules', () => {
      const plugin = shim({foo: 'hello', bar: 'other'})
      const idA = plugin.resolveId('foo')
      const idB = plugin.resolveId('bar')
      expect(idA).to.not.equal(idB)
      expect(idA).to.match(/rollup-plugin-shim-\d+/)
      expect(idB).to.match(/rollup-plugin-shim-\d+/)
    })
  })

  describe('#shim.load', () => {
    it('should ignore unspecified modules', () => {
      const plugin = shim({foo: 'hello'})
      const id = plugin.resolveId('missing')
      const value = plugin.load(id)
      expect(value).to.equal(null)
    })

    it('should return string content for specified module', () => {
      const plugin = shim({foo: 'hello'})
      const id = plugin.resolveId('foo')
      const value = plugin.load(id)
      expect(value).to.equal('hello')
    })
  })

  describe('rollup', () => {
    const foo = 'export const named = 10'
    const bar = 'export default function (a, b, c) { return a + b.itemA + b.itemB + c() }'
    const baz = 'export const itemA = 1\nexport const itemB = 2'
    const depended = 'export function depended () { return 5 }'

    it('should work with rollup', () => {
      const options = {
        entry: fixture('es6.js'),
        plugins: [
          shim({foo, bar, baz, [fixture('es6-dep.js')]: depended}),
        ],
      }

      return rollup.rollup(options)
        .then(bundle => bundle.generate({format: 'cjs'}))
        .then(generated => {
          const code = generated.code
          fs.writeFileSync(fixture('out/es6.js'), code)
          expect(code).to.contain('named = 10')
          expect(code).to.contain('itemA = 1')
          expect(code).to.contain('itemB = 2')
          expect(code).to.contain('return 5') // depended swapped
          expect(code).to.not.contain('return 100') // depended original

          const result = eval(code) // eslint-disable-line no-eval
          expect(result).to.eql(18)
        })
    })

    it('should work with rollup and commonjs', () => {
      const options = {
        entry: fixture('node.js'),
        onwarn: () => undefined,
        plugins: [
          shim({foo, bar, baz, [fixture('node-dep.js')]: depended}),
          commonjs(),
        ],
      }

      return rollup.rollup(options)
        .then(bundle => bundle.generate({format: 'cjs'}))
        .then(generated => {
          const code = generated.code
          fs.writeFileSync(fixture('out/node.js'), code)

          const result = eval(code) // eslint-disable-line no-eval
          expect(result).to.eql(18)
        })
    })
  })
})

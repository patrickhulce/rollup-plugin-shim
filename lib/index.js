const path = require('path')

function shim(options = {}) {
  let moduleId = 0
  const importToIdMap = new Map()
  const idToModuleMap = new Map()

  for (const importExpression of Object.keys(options)) {
    moduleId++
    const identifier = `\0rollup-plugin-shim-${moduleId}`
    importToIdMap.set(importExpression, identifier)
    importToIdMap.set(identifier, identifier)
    idToModuleMap.set(identifier, {module: options[importExpression], importExpression})
  }

  return {
    resolveId(importExpression, importer = '') {
      return importToIdMap.get(importExpression) ||
        importToIdMap.get(path.join(importer, '../', importExpression)) ||
        null
    },
    load(id) {
      const value = idToModuleMap.get(id)
      return (value && value.module) || null
    },
  }
}

module.exports = shim
module.exports.default = shim

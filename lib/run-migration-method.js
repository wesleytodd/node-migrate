'use strict'

module.exports = runMigrationMethod

function runMigrationMethod (migration, method, fn) {
  // Missing method
  if (typeof migration[method] !== 'function') {
    console.log(migration)
    return fn(new TypeError('Migration ' + migration.title + ' does not have method ' + method))
  }

  migration[method](function (err) {
    if (err) return fn(err)

    // Set timestamp if running up, clear it if down
    if (method === 'up') {
      migration.timestamp = Date.now()
    } else if (method === 'down') {
      migration.timestamp = null
    }

    // Successfully ran
    fn()
  })
}

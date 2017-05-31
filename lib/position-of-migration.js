'use strict'

module.exports = function positionOfMigration (set, title) {
  for (var i = 0; i < set.migrations.length; ++i) {
    if (set.migrations[i].title === title) return i
  }
  return -1
}

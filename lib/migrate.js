'use strict'
var positionOfMigration = require('./position-of-migration')
var runMigrationMethod = require('./run-migration-method')

module.exports = migrate

function migrate (set, direction, migrationName, fn) {
  var migrations = []
  var lastRunIndex
  var toIndex

  if (!migrationName) {
    toIndex = direction === 'up' ? set.migrations.length : 0
  } else if ((toIndex = positionOfMigration(set, migrationName)) === -1) {
    return fn(new Error('Could not find migration: ' + migrationName))
  }

  lastRunIndex = positionOfMigration(set, set.lastRun)
  migrations = (direction === 'up' ? upMigrations : downMigrations)(set, lastRunIndex, toIndex)

  function next (migration) {
    // Done running migrations
    if (!migration) return fn()

    runMigrationMethod(migration, direction, function (err) {
      if (err) return fn(err)
      set.emit('migration', migration, direction)

      // Update migration state
      lastRunIndex--
      set.lastRun = direction === 'up' ? migration.title : set.migrations[lastRunIndex] && set.migrations[lastRunIndex].title
      set.save(function (err) {
        if (err) return fn(err)

        next(migrations.shift())
      })
    })
  }

  next(migrations.shift())
}

function upMigrations (set, lastRunIndex, toIndex) {
  return set.migrations.reduce(function (arr, migration, index) {
    if (index > toIndex) {
      return arr
    }

    if (index < lastRunIndex && !migration.timestamp) {
      set.emit('warning', 'migrations running out of order')
    }

    if (!migration.timestamp) {
      arr.push(migration)
    }

    return arr
  }, [])
}

function downMigrations (set, lastRunIndex, toIndex) {
  return set.migrations.reduce(function (arr, migration, index) {
    if (index < toIndex || index > lastRunIndex) {
      return arr
    }

    if (migration.timestamp) {
      arr.push(migration)
    }

    return arr
  }, []).reverse()
}

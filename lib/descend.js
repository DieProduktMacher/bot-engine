'use strict'

// Library modules
const initializeDispatcher = require('./initialize-dispatcher')
const run = require('./run')

module.exports = (workers, topDispatcher, store, bot, helpers) => {
  const dispatcher = initializeDispatcher(workers, topDispatcher)
  run(dispatcher, store, bot, helpers)
}

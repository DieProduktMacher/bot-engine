'use strict'

// Standard module
const {EventEmitter} = require('events')

// Library modules
const log = require('level-logger')('lib:bot:dispatcher')
const registerWorkers = require('./register-workers')

module.exports = (workers, topDispatcher) => {
  log.debug('initialzing', {workers, topDispatcher})
  const dispatcher = new EventEmitter()
  registerWorkers(dispatcher, workers, topDispatcher)
  return dispatcher
}

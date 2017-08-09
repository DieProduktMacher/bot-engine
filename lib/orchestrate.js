'use strict'

// Library modules
const log = require('level-logger')('lib:bot:orchestrate')
const initializeStore = require('./initialize-store')
const initializeDispatcher = require('./initialize-dispatcher')
const run = require('./run')
const next = require('./next')
const descend = require('./descend')

module.exports = ({input, sessionDefaults, workers, reducer, persistence, tracking, send, userData, helpers}) => {
  // Always show typing. Facebook will automaticly remove this after a few seconds
  return send.typingOn(input.sender)
    .then(_ => persistence.retrieveSession(input.sender))
    .then(session => Promise.resolve(Object.assign(sessionDefaults || {}, session)))
    .then(session => userData(session.user)
      .then(userData => Promise.resolve(Object.assign(session, {userData}))))
    .then(session => {
      log.debug('starting session:', session)
      const store = initializeStore({input, session}, reducer)

      // store.subscribe(() => {
      //   log.debug('STATE_CHANGED', store.getState())
      // })

      const dispatcher = initializeDispatcher(workers)

      dispatcher.on('finished', _ => {
        const {session, hookChain} = store.getState()
        if (hookChain.length) persistence.persistSession(Object.assign({}, session, {hookChain}))
      })
      return run(dispatcher, store, {send, next, descend, tracking}, helpers)
    })
}

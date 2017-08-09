'use strict'

// Library modules
process.env.DEBUG = 'lib:bot:run'
// const log = require('level-logger')('lib:bot:run')

module.exports = (dispatcher, store, bot, helpers) => {
  const {session, hookChain} = store.getState()
  const name = session.hookChain[hookChain.length] || 'main'

  store.dispatch({
    type: 'BOT_STEP_DOWN',
    name
  })

  // TODO: Handle unknown input. e.g. worker name is not in workers list
  dispatcher.emit(name, dispatcher, store, bot, helpers)
}

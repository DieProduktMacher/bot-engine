'use strict'

// Library modules
const log = require('level-logger')('bot-worker-enging:reducer')

module.exports = (appReducer) => (state, action) => {
  log.debug('BOT_REDUCE:', action.type)
  let session, hookChain
  switch (action.type) {
    case 'BOT_OVERRIDE_HOOK_CHAIN':
      session = Object.assign({}, state.session)
      session.hookChain = action.hookChain
      return Object.assign({}, state, {session, changingHook: true})

    case 'BOT_STEP_DOWN':
      log.debug('STATE.HOOKCHAIN before', state)
      hookChain = state.hookChain.slice(0).concat(action.name)
      log.debug('STATE.HOOKCHAIN after', hookChain)
      return Object.assign({}, state, {hookChain})

    case 'BOT_STEP_UP':
      session = Object.assign({}, state.session)
      hookChain = state.hookChain.slice(0, -1)
      return Object.assign({}, state, {session, hookChain, changingHook: true})

    case 'BOT_NEXT_HOOK':
      hookChain = state.hookChain.slice(0, -1).concat(action.name)
      log.debug('HOOKCHAIN', hookChain)
      session = Object.assign({}, state.session, {hookChain})
      return Object.assign({}, state, {session, hookChain, changingHook: true})

    case 'BOT_CLEAN':
      return {}

    default:
      log.debug('DEFAULT', state)
      return typeof appReducer === 'function' ? appReducer(state, action) : state
  }
}

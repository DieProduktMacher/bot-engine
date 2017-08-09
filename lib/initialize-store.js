'use strict'

// NPM Modules
const redux = require('redux')

// Library modules
const reducer = require('./reducer')

module.exports = ({input, session}, appReducer) => {
  session.hookChain = session.hookChain || []
  const initialState = {
    input,
    session,
    hookChain: []
  }
  const store = redux.createStore(reducer(appReducer), initialState)
  if (input.payload.data.hookChain) {
    store.dispatch({
      type: 'BOT_OVERRIDE_HOOK_CHAIN',
      hookChain: input.payload.data.hookChain
    })
  }
  return store
}

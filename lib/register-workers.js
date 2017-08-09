'use strict'

// Library modules
const log = require('level-logger')('bot-worker-enging:dispatcher')

module.exports = (dispatcher, workers, topDispatcher) => {
  log.debug('registering workers', {dispatcher, workers, topDispatcher})
  Object.keys(workers).forEach((name) => {
    dispatcher.on(name, (dispatcher, store, bot, helpers) => {
      log.debug(`on ${name}`, store)
      const {hookChain} = store.getState()
      const previousName = hookChain[hookChain.length - 1]
      if (name !== previousName) {
        log.debug('SWITCHING FROM', previousName, 'TO', name)
        store.dispatch({type: 'BOT_NEXT_HOOK', name})
      }
      workers[name](dispatcher, store, bot, helpers)
    })
  })

  // add completion hooks
  const completionEvents = ['completed', 'failed']
  completionEvents.forEach(completionEvent => {
    dispatcher.on(completionEvent, (_, store, bot, helpers) => {
      const {hookChain} = store.getState()
      const name = hookChain[hookChain.length - 1]
      log.debug(`${name}:${completionEvent}`)
      // reemit the completed event with the current hook name
      dispatcher.emit(`${name}:${completionEvent}`, dispatcher, store, bot, helpers)
    })
  })

  // add completed and finished events if there is a topDispatcher
  if (topDispatcher) {
    dispatcher.on('finished', () => topDispatcher.emit('finished'))
    dispatcher.on('up', (_, store, bot, helpers) => dispatcher.emit('up:completed', dispatcher, store, bot, helpers))

    // add "up" events for registered events on topDispatcher
    topDispatcher.eventNames().forEach(eventName => {
      dispatcher.on(`up:${eventName}`, (_, store, bot, helpers) => {
        store.dispatch({type: 'BOT_STEP_UP'})
        topDispatcher.emit(eventName, topDispatcher, store, bot, helpers)
      })
    })

    // add "up" completion hooks
    completionEvents.forEach(completionEvent => {
      dispatcher.on(`up:${completionEvent}`, (td, store, bot, helpers) => {
        store.dispatch({type: 'BOT_STEP_UP'})
        topDispatcher.emit(completionEvent, topDispatcher, store, bot, helpers)
      })
    })
  }
}

'use strict'

module.exports = (name) => (dispatcher, store, bot, helpers) => {
  dispatcher.emit(name, dispatcher, store, bot, helpers)
}

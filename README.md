# Bot Worker Engine

[![Build Status](https://travis-ci.org/DieProduktMacher/bot-worker-engine.svg?branch=master)](https://travis-ci.org/DieProduktMacher/bot-worker-engine)[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)


A simple bot engine dispatching workers. (mostly and deliberately without OOP)

## Installation

```
npm install bot-worker-engine
```

## Usage

Here is a simple counting echo bot as example. This might be inside the function which received a web hook call and normalized the input data from one messaging event

```javascript
const {orchestrate} = require('bot-worker-engine')
const {send, userDate} = require('<platform-dependent-connector>')
const persistence = require('<persistence-layer')
// these are where your code goes
const helpers = require('./helpers') // any helper functions you might need
// example worker just
const workers = {
  main: (dispatcher, store, bot, helpers) => {
    const {text, session} = store.getState().input
    bot.send.text(`Echo (${session.count}): ${text}`)
    store.dispatch({type: 'INCREMENT_COUNT'})
    dispatcher.emit('finished')
  }
}
const reducer = (action, state) => {
  switch(action.type) {
    case 'INCREMENT_COUNT':
      const session = state.session
      session.count++
      return Object.assign({}, state, {session})
    default:
      return state
  }
} // Redux reducer function
const sessionDefaults = {count: 1} // defaults for empty sessions

// this starts the whole process of the normalized input
orchestrate({input, sessionDefaults, workers, reducer, persistence, send, userData, helpers})
```

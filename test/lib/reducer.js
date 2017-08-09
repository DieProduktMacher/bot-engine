'use strict'

describe('reducer', function () {
  let reducer
  beforeEach(function () {
    reducer = libRequire('reducer')()
  })

  it('Type: BOT_OVERRIDE_HOOK_CHAIN', function () {
    const action = {
      type: 'BOT_OVERRIDE_HOOK_CHAIN',
      hookChain: ['level1', 'level2']
    }
    const state = reducer({}, action)
    expect(state.session.hookChain).to.equal(action.hookChain)
  })

  it('Type: BOT_STEP_DOWN', function () {
    const action = {
      type: 'BOT_STEP_DOWN',
      name: 'level2'
    }
    const state = reducer({hookChain: ['level1']}, action)
    expect(state.hookChain).to.eql(['level1', action.name])
  })

  it('Type: BOT_STEP_UP', function () {
    const actionUp = {
      type: 'BOT_STEP_UP'
    }
    const state = reducer({hookChain: ['level1', 'level2']}, actionUp)
    expect(state.hookChain).to.eql(['level1'])
  })

  it('Type: BOT_NEXT_HOOK', function () {
    const action = {
      type: 'BOT_NEXT_HOOK',
      name: 'next'
    }
    const state = reducer({hookChain: ['previous']}, action)
    expect(state.hookChain).to.eql([action.name])
  })

  it('Type: BOT_CLEAN', function () {
    const action = {
      type: 'BOT_CLEAN'
    }
    const state = reducer({not: {empty: false}}, action)
    expect(state).to.eql({})
  })

  it('Type: NOT_KNOWN without appReducer', function () {
    const state = {any: 'state'}
    const action = {
      type: 'NOT_KNOWN',
      foo: 'bar'
    }
    const newState = reducer(state, action)
    expect(newState).to.eql(state)
  })

  it('Type: NOT_KNOWN with appReducer', function () {
    const appReducer = sinon.stub()
    const state = {any: 'state'}
    const action = {
      type: 'NOT_KNOWN',
      foo: 'bar'
    }
    reducer = libRequire('reducer')(appReducer)
    reducer(state, action)
    expect(appReducer).to.have.been.calledWith(state, action)
  })
})

'use strict'

describe('initializeStore', function () {
  const initializingState = {session: {}, input: {payload: {data: {}}}}
  let initializeStore,
    redux,
    reducer
  beforeEach(function () {
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    })

    redux = {
      createStore: sinon.stub()
    }
    mockery.registerMock('redux', redux)

    reducer = sinon.stub().callsFake(_ => 'reducer')
    mockery.registerMock('./reducer', reducer)

    initializeStore = libRequire('initialize-store')
  })

  afterEach(function () {
    mockery.deregisterAll()
    mockery.disable()
  })

  it('Init proccess without appReducer', function () {
    const initialState = Object.assign({}, initializingState, {hookChain: []})
    initializeStore(initializingState)
    expect(reducer).to.have.been.calledWith(undefined)
    expect(redux.createStore).to.have.been.calledWith('reducer', initialState)
  })

  it('Init proccess with appReducer', function () {
    const initialState = Object.assign({}, initializingState, {hookChain: []})
    initializeStore(initializingState, 'appReducer')
    expect(reducer).to.have.been.calledWith('appReducer')
    expect(redux.createStore).to.have.been.calledWith('reducer', initialState)
  })

  it('Dispatches override action for hookChain in payload', function () {
    initializingState.input.payload.data.hookChain = ['ovveride']
    const dispatch = sinon.stub()
    redux.createStore.callsFake(_ => ({dispatch}))
    initializeStore(initializingState)
    expect(dispatch).to.have.been.calledWith({
      type: 'BOT_OVERRIDE_HOOK_CHAIN',
      hookChain: initializingState.input.payload.data.hookChain
    })
  })
})

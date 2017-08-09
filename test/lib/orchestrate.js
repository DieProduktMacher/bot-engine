'use strict'

const {EventEmitter} = require('events')

describe('orchestrate', function () {
  let orchestrate,
    initializeStore, initializeDispatcher,
    run, next, descend,
    send, persistence, userData, userDataResult,
    store, dispatcher,
    input, sessionDefaults, reducer, workers, helpers,
    finalState, finalSession

  beforeEach(function () {
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    })

    initializeStore = sinon.stub().callsFake(() => store)
    initializeDispatcher = sinon.stub().callsFake(_ => dispatcher)

    run = sinon.stub()
    next = sinon.stub()
    descend = sinon.stub()

    mockery.registerMock('./initialize-store', initializeStore)
    mockery.registerMock('./initialize-dispatcher', initializeDispatcher)
    mockery.registerMock('./run', run)
    mockery.registerMock('./next', next)
    mockery.registerMock('./descend', descend)

    send = {
      typingOn: sinon.stub().callsFake((user) => Promise.resolve())
    }
    persistence = {
      retrieveSession: sinon.stub().callsFake(user => Promise.resolve({user})),
      persistSession: sinon.stub().callsFake(session => Promise.resolve())
    }

    finalState = {
      session: {
        foo: 'bar'
      },
      hookChain: []
    }

    finalSession = {
      foo: 'bar',
      hookChain: ['hookChain']
    }

    store = {
      subscribe: sinon.stub(),
      dispatch: sinon.stub(),
      getState: sinon.stub().callsFake(() => finalState)
    }

    dispatcher = new EventEmitter()

    userDataResult = {first_name: 'Alfred'}
    userData = sinon.stub().callsFake(_ => Promise.resolve(userDataResult))

    input = {
      sender: {id: 'sender'},
      payload: {
        data: {}
      }
    }

    sessionDefaults = {
      default: true
    }

    reducer = () => {}

    helpers = {}

    orchestrate = libRequire('orchestrate')
  })

  afterEach(function () {
    mockery.deregisterAll()
    mockery.disable()
  })

  it('sends typingOn to the sender', function () {
    return orchestrate({input, workers, reducer, persistence, send, userData})
      .then(_ => expect(send.typingOn).to.have.been.calledWith(input.sender))
  })

  it('retrieves session from persistence', function () {
    return orchestrate({input, workers, reducer, persistence, send, userData})
      .then(_ => expect(persistence.retrieveSession).to.have.been.calledWith(input.sender))
  })

  it('retrieves session from persistence', function () {
    return orchestrate({input, workers, reducer, persistence, send, userData})
      .then(_ => expect(persistence.retrieveSession).to.have.been.calledWith(input.sender))
  })

  it('fetches the userData', function () {
    return orchestrate({input, workers, reducer, persistence, send, userData})
      .then(_ => expect(userData).to.have.been.calledWith(input.sender))
  })

  it('initializes the store with input and session (extended with the userData)', function () {
    return orchestrate({input, workers, reducer, persistence, send, userData})
      .then(_ => {
        expect(initializeStore).to.have.been.calledWith({input, session: {user: input.sender, userData: userDataResult}}, reducer)
      })
  })

  it('set sessionDefaults before initializing the store', function () {
    return orchestrate({input, sessionDefaults, workers, reducer, persistence, send, userData})
      .then(_ => expect(initializeStore).to.have.been.calledWith({input, session: {user: input.sender, userData: userDataResult, default: true}}, reducer))
  })

  it('initializes a dispatcher woth the workers', function () {
    return orchestrate({input, workers, reducer, persistence, send, userData})
      .then(_ => expect(initializeDispatcher).to.have.been.calledWith(workers))
  })

  it('runs with the orchestrated objects', function () {
    const tracking = 'tracking'
    return orchestrate({input, workers, reducer, persistence, send, userData, helpers, tracking})
    .then(_ => expect(run).to.have.been.calledWith(dispatcher, store, {send, next, descend, tracking}, helpers))
  })

  it('does not persist the finalSession when the dispatcher is finished but the hookChain is empty', function () {
    return orchestrate({input, workers, reducer, persistence, send, userData})
    .then(_ => {
      dispatcher.emit('finished')
      expect(persistence.persistSession).to.not.have.been.calledWith(finalSession)
    })
  })

  it('presists the the finalSession when the dispatcher is finished and the hookChain is not empty', function () {
    finalState.hookChain = ['hookChain']
    return orchestrate({input, workers, reducer, persistence, send, userData})
    .then(_ => {
      dispatcher.emit('finished')
      expect(persistence.persistSession).to.have.been.calledWith(finalSession)
    })
  })
})

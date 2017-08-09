'use strict'

describe('initializeDispatcher', function () {
  const EventEmitter = function () {}

  let initializeDispatcher, registerWorkers, EventEmitterStub, fakeDispatcher

  beforeEach(function () {
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    })

    fakeDispatcher = sinon.createStubInstance(EventEmitter)

    registerWorkers = sinon.stub()
    EventEmitterStub = sinon.spy(function () {
      return fakeDispatcher
    })
    mockery.registerMock('./register-workers', registerWorkers)
    mockery.registerMock('events', {EventEmitter: EventEmitterStub})

    initializeDispatcher = libRequire('initialize-dispatcher')
  })

  afterEach(function () {
    mockery.deregisterAll()
    mockery.disable()
  })

  it('creates a dispatcher and registers workers on it', function () {
    const workers = 'workers'
    const topDispatcher = 'topDispatcher'
    const dispatcher = initializeDispatcher(workers, topDispatcher)
    assert(EventEmitterStub.calledWithNew())
    expect(registerWorkers).to.have.been.calledWith(fakeDispatcher, workers, topDispatcher)
    expect(dispatcher).to.equal(fakeDispatcher)
  })
})

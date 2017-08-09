'use strict'

describe('bot/descend', function () {
  let descend,
    initializeDispatcher, run

  beforeEach(function () {
    mockery.enable({
      useCleanCache: true,
      warnOnReplace: false,
      warnOnUnregistered: false
    })

    initializeDispatcher = sinon.stub().callsFake(_ => 'dispatcher')
    run = sinon.stub()

    mockery.registerMock('./initialize-dispatcher', initializeDispatcher)
    mockery.registerMock('./run', run)

    descend = libRequire('descend')
  })

  afterEach(function () {
    mockery.deregisterAll()
    mockery.disable()
  })

  it('descends with the given workers', function () {
    descend('workers', 'topDispatcher', 'store', 'bot', 'helpers')
    expect(initializeDispatcher).to.have.been.calledWith('workers', 'topDispatcher')
    expect(run).to.have.been.calledWith('dispatcher', 'store', 'bot', 'helpers')
  })
})

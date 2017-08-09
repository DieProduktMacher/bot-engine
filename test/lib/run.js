'use strict'

const run = libRequire('run')

describe('run', function () {
  it('check for specific hook in hook chain', function () {
    const testHook = 'testworker'
    const store = {
      getState () {
        return {
          session: {
            hookChain: [testHook]
          },
          hookChain: []
        }
      },
      dispatch (action) {
        expect(action.name).to.equal(testHook)
        expect(action.type).to.equal('BOT_STEP_DOWN')
      }
    }

    const dispatcher = {
      emit: sinon.stub()
    }

    run(dispatcher, store, {})
    expect(dispatcher.emit).to.have.been.calledWith(testHook, dispatcher, store, {})
  })

  it('check for default hook', function () {
    const store = {
      getState () {
        return {
          session: {
            hookChain: []
          },
          hookChain: []
        }
      },
      dispatch (action) {
        expect(action.name).to.equal('main')
        expect(action.type).to.equal('BOT_STEP_DOWN')
      }
    }

    const dispatcher = {
      emit: sinon.stub()
    }

    run(dispatcher, store, {})
    expect(dispatcher.emit).to.have.been.calledWith('main', dispatcher, store, {})
  })
})

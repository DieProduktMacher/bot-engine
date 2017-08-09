'use strict'

const next = libRequire('next')

describe('next', function () {
  it('check next state', function () {
    const store = {
      getState () {
        return {
          hookChain: ['level1', 'level2']
        }
      },
      dispatch (action) {
        expect(action.name).to.equal('level2')
        expect(action.type).to.equal('BOT_NEXT_HOOK')
      }
    }

    const dispatcher = {
      emit: sinon.stub()
    }

    next('level2')(dispatcher, store, {})
    expect(dispatcher.emit).to.have.been.calledWith('level2', dispatcher, store, {})
  })
})

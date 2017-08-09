'use strict'

const {EventEmitter} = require('events')

const registerWorkers = libRequire('register-workers')
const workerCompletionEvents = ['completed', 'failed']

describe('registerWorkers', function () {
  let dispatcher,
    dispatcherOn,
    dispatcherEmit,
    workers,
    store

  beforeEach(function () {
    dispatcher = new EventEmitter()
    dispatcherOn = sinon.spy(dispatcher, 'on')
    dispatcherEmit = sinon.spy(dispatcher, 'emit')
    store = {
      getState: sinon.stub(),
      dispatch: sinon.stub()
    }
    workers = {
      worker1: sinon.stub(),
      worker2: sinon.stub()
    }
    registerWorkers(dispatcher, workers)
  })
  it('registers workers with names', function () {
    expect(dispatcherOn).to.have.been.calledWith('worker1')
    expect(dispatcherOn).to.have.been.calledWith('worker2')
  })

  describe('completion events', function () {
    workerCompletionEvents.forEach(workerCompletionEvent => {
      it(`registers "${workerCompletionEvent}"`, function () {
        expect(dispatcherOn).to.have.been.calledWith(workerCompletionEvent)
      })
    })
  })

  describe('when events get triggered', function () {
    beforeEach(function () {
      store.getState.callsFake(() => ({hookChain: ['worker1']}))
    })
    it('calls the registered workers function', function () {
      dispatcher.emit('worker1', dispatcher, store, 'bot', 'helpers')
      expect(workers.worker1).to.have.been.calledWith(dispatcher, store, 'bot', 'helpers')
    })
    it('dispatches the BOT_NEXT_HOOK action on the store when hook is changing', function () {
      dispatcher.emit('worker2', dispatcher, store, 'bot', 'helpers')
      expect(store.dispatch).to.have.been.calledWith({
        type: 'BOT_NEXT_HOOK',
        name: 'worker2'
      })
    })
    it('does not dispatch the BOT_NEXT_HOOK action on the store when hook is not changing', function () {
      dispatcher.emit('worker1', dispatcher, store, 'bot', 'helpers')
      expect(store.dispatch).to.not.have.been.calledWith({
        type: 'BOT_NEXT_HOOK',
        name: 'worker1'
      })
    })

    describe('completion events', function () {
      workerCompletionEvents.forEach(workerCompletionEvent => {
        it(`re-emits ${workerCompletionEvent} with the worker name`, function () {
          dispatcher.emit(workerCompletionEvent, dispatcher, store, 'bot', 'helpers')
          assert(store.getState.calledOnce)
          expect(dispatcherEmit).to.have.been.calledWith(`worker1:${workerCompletionEvent}`, dispatcher, store, 'bot', 'helpers')
        })
      })
    })
  })

  describe('propagation with topDispatcher', function () {
    let topDispatcher,
      topDispatcherEmit

    beforeEach(function () {
      topDispatcher = new EventEmitter()
      topDispatcher.on('topworker', () => {})
      topDispatcherEmit = sinon.spy(topDispatcher, 'emit')
      registerWorkers(dispatcher, {}, topDispatcher)
    })

    it('registers "up" event', function () {
      expect(dispatcherOn).to.have.been.calledWith('up')
    })

    describe('completion events', function () {
      it('registers "finished"', function () {
        expect(dispatcherOn).to.have.been.calledWith('finished')
      })

      workerCompletionEvents.forEach(workerCompletionEvent => {
        it(`registers "up:${workerCompletionEvent}"`, function () {
          expect(dispatcherOn).to.have.been.calledWith(`up:${workerCompletionEvent}`)
        })
      })
    })

    it('registers "up" events for eventNames on topDispatcher', function () {
      expect(dispatcherOn).to.have.been.calledWith('up:topworker')
    })

    describe('when events get triggered', function () {
      it('propagates "finished" event from dispatcher to topDispatcher', function () {
        dispatcher.emit('finished')
        expect(topDispatcher.emit).to.have.been.calledWith('finished')
      })

      describe('stepping upwards', function () {
        it('re-emits "up" event as "up:completed"', function () {
          dispatcher.emit('up', 'dispatcher', store, 'bot', 'helpers')
          expect(dispatcherEmit).to.have.been.calledWith('up:completed', dispatcher, store, 'bot', 'helpers')
        })

        describe('"up:<topworkername>" event', function () {
          beforeEach(function () {
            dispatcher.emit('up:topworker', dispatcher, store, 'bot', 'helpers')
          })

          it('dispatches BOT_STEP_UP action on the store', function () {
            expect(store.dispatch).to.have.been.calledWith({type: 'BOT_STEP_UP'})
          })
          it('propagates the "<topworkername>" event to the topDispatcher', function () {
            expect(topDispatcherEmit).to.have.been.calledWith('topworker', topDispatcher, store, 'bot', 'helpers')
          })
        })

        describe('completion events', function () {
          workerCompletionEvents.forEach(workerCompletionEvent => {
            beforeEach(function () {
              dispatcher.emit(`up:${workerCompletionEvent}`, dispatcher, store, 'bot', 'helpers')
            })

            it('dispatches "BOT_STEP_UP" action on the store', function () {
              expect(store.dispatch).to.have.been.calledWith({type: 'BOT_STEP_UP'})
            })
            it(`propagates up:${workerCompletionEvent} as ${workerCompletionEvent} to topDispatcher`, function () {
              expect(topDispatcherEmit).to.have.been.calledWith(workerCompletionEvent, topDispatcher, store, 'bot', 'helpers')
            })
          })
        })
      })
    })
  })
})

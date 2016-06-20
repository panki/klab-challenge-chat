/*globals it, describe, beforeEach*/
import {assert} from 'chai'
import sinon from 'sinon'
import 'sinon-as-promised'
import Messenger from '../app/messenger'
import {message} from '../app/commands'

describe('Messenger', () => {
  const TEST_CHANNEL = 'test_channel'
  const TEST_CHANNEL_MESSAGES = [
    message('author1', TEST_CHANNEL, 'text1'),
    message('author2', TEST_CHANNEL, 'text2'),
    message('author3', TEST_CHANNEL, 'text3')
  ]

  var messenger, fakeStore, storeMock

  beforeEach(() => {
    fakeStore = {
      on: () => {},
      put: () => {},
      publish: () => {},
      getLastMessages: (channel) => new Promise((resolve, reject) => {
        if (channel === TEST_CHANNEL) resolve(TEST_CHANNEL_MESSAGES)
        else resolve([])
      })
    }
    storeMock = sinon.mock(fakeStore)
    messenger = new Messenger(fakeStore)
  })

  it('Should subscribe to message event from store', () => {
    const store = sinon.mock(fakeStore)
    store.expects('on').once().withArgs('message')
    assert.isObject(new Messenger(fakeStore))
    store.verify()
  })

  it('Should emit channel history on subscribe', () => {
    const cb = sinon.spy()
    return messenger.subscribe(TEST_CHANNEL, cb).then(() => {
      assert.equal(cb.callCount, TEST_CHANNEL_MESSAGES.length)
      TEST_CHANNEL_MESSAGES.forEach((message, i) => {
        assert.equal(cb.getCall(i).args[0], message)
      })
    })
  })

  it('Should use channel_history_size to get last messages from channel', () => {
    const historySize = 9
    const messenger = new Messenger(fakeStore, {channel_history_size: historySize})
    const getMessages = sinon.stub(fakeStore, 'getLastMessages').resolves([])
    const cb = sinon.spy()
    messenger.subscribe(TEST_CHANNEL, cb)
    assert.isTrue(getMessages.calledWith(TEST_CHANNEL, historySize))
  })

  it('Should emit messages from store', () => {
    const cb = sinon.spy()
    const msg = message('author', 'empty_channel')
    return messenger.subscribe('empty_channel', cb).then(() => {
      messenger.onStoreMessage(msg)
      assert.isTrue(cb.calledOnce)
      assert.isTrue(cb.calledWith(msg))
    })
  })

  it('Should unsubscribe from channel', () => {
    const cb = sinon.spy()
    const msg = message('author', TEST_CHANNEL)
    // subscribe
    messenger.subscribe(TEST_CHANNEL, cb)
    messenger.unsubscribe(TEST_CHANNEL, cb)
    // fire message from store
    messenger.onStoreMessage(msg)
    // checks
    assert.isFalse(cb.called)
  })

  it('Should send message to store', () => {
    const msg = message('author', TEST_CHANNEL)
    storeMock.expects('put').once().withArgs(msg)
    messenger.send(msg)
    storeMock.verify()
  })

  it('Should publish message to store', () => {
    const msg = message('author', TEST_CHANNEL)
    storeMock.expects('publish').once().withArgs(msg)
    messenger.notify(msg)
    storeMock.verify()
  })
})

/*globals it, describe, beforeEach*/
import {assert} from 'chai'
import sinon from 'sinon'
import 'sinon-as-promised'
import Client from '../app/client'
import {message, messageCommand, setNickCommand, joinChannelCommand,
  CMD_MESSAGE} from '../app/commands'

describe('Client', () => {
  const TEST_CHANNEL = 'test_channel'

  var client, fakeMessenger, messengerMock,
    fakeConnection, connectionMock

  beforeEach(() => {
    fakeMessenger = {
      subscribe: () => {},
      unsubscribe: () => {},
      send: () => {},
      notify: () => {}
    }
    messengerMock = sinon.mock(fakeMessenger)
    fakeConnection = {
      on: () => {},
      send: () => {},
      close: () => {},
      removeListener: () => {}
    }
    connectionMock = sinon.mock(fakeConnection)
    client = new Client(fakeConnection, fakeMessenger)
  })

  it('Should subscribe connection events on start', () => {
    connectionMock.expects('on').once().withArgs('message', client.clientActionHandler)
    connectionMock.expects('on').once().withArgs('close', client.stopHandler)
    client.start()
    connectionMock.verify()
  })

  it('Should unsubscribe on stop', () => {
    connectionMock.expects('removeListener').once().withArgs('message', client.clientActionHandler)
    connectionMock.expects('removeListener').once().withArgs('close', client.stopHandler)
    connectionMock.expects('close').once()
    const unsubscribe = sinon.spy(client, 'unsubscribe')
    client.stop()
    connectionMock.verify()
    assert.isTrue(unsubscribe.calledOnce)
  })

  it('Should subscribe to channel', () => {
    messengerMock.expects('subscribe').once().withArgs(TEST_CHANNEL, client.messangerHandler)
    client.subscribe(TEST_CHANNEL)
    assert.equal(client.channel, TEST_CHANNEL)
    messengerMock.verify()
    // test double subscribe
    client.subscribe(TEST_CHANNEL)
    messengerMock.verify()
  })

  it('Should unsubscribe from channel', () => {
    client.subscribe(TEST_CHANNEL)
    messengerMock.expects('unsubscribe').once().withArgs(TEST_CHANNEL, client.messangerHandler)
    client.unsubscribe()
    assert.isUndefined(client.channel)
    messengerMock.verify()
    // test double unsubscribe
    client.unsubscribe()
    messengerMock.verify()
  })

  it('Should unsubscribe from previous channel', () => {
    client.subscribe(TEST_CHANNEL)
    const unsubscribe = sinon.spy(client, 'unsubscribe')
    client.subscribe('another_channel')
    assert.isTrue(unsubscribe.calledOnce)
  })

  it('Should send system message command on notify', () => {
    client.subscribe(TEST_CHANNEL)
    const send = sinon.stub(fakeConnection, 'send')
    client.notify('test')

    assert.isTrue(send.calledOnce)
    const cmd = send.getCall(0).args[0]
    assert.equal(cmd.command, CMD_MESSAGE)
    assert.equal(cmd.data.author, 'system')
    assert.equal(cmd.data.channel, client.channel)
    assert.equal(cmd.data.text, 'test')
  })

  it('Should notify messenger on notifyChannel', () => {
    client.subscribe(TEST_CHANNEL)
    const notify = sinon.stub(fakeMessenger, 'notify')
    client.notifyChannel('test')

    assert.isTrue(notify.calledOnce)
    const msg = notify.getCall(0).args[0]
    assert.equal(msg.author, 'system')
    assert.equal(msg.channel, client.channel)
    assert.equal(msg.text, 'test')
  })

  it('Should set nick', () => {
    client.subscribe(TEST_CHANNEL)
    const notify = sinon.spy(client, 'notify')
    const notifyChannel = sinon.spy(client, 'notifyChannel')

    client.setNick('test')

    assert.equal(client.nick, 'test')
    assert.isTrue(notify.calledOnce)
    assert.isTrue(notifyChannel.calledOnce)

    // test double call
    client.setNick('test')
    assert.isTrue(notify.calledOnce)
    assert.isTrue(notifyChannel.calledOnce)
  })

  it('Should handle set nick action', () => {
    const setNick = sinon.spy(client, 'setNick')
    const testNick = 'test_nick'

    client.onClientAction({ action: setNickCommand(testNick) })

    assert.isTrue(setNick.calledOnce)
    assert.equal(setNick.getCall(0).args[0], testNick)
  })

  it('Should handle join channel action', () => {
    const subscribe = sinon.spy(client, 'subscribe')

    client.onClientAction({ action: joinChannelCommand(TEST_CHANNEL) })

    assert.isTrue(subscribe.calledOnce)
    assert.equal(subscribe.getCall(0).args[0], TEST_CHANNEL)
  })

  it('Should handle send message action', () => {
    const send = sinon.stub(fakeMessenger, 'send')

    client.onClientAction({ action: messageCommand('author', TEST_CHANNEL, 'text') })

    assert.isTrue(send.calledOnce)
    assert.equal(send.getCall(0).args[0].author, 'author')
    assert.equal(send.getCall(0).args[0].channel, TEST_CHANNEL)
    assert.equal(send.getCall(0).args[0].text, 'text')
  })

})

import EventEmitter from 'events'
import config from './config'

class Messenger {
  constructor (store, options) {
    this.store = store
    this.options = options || config.messenger
    this.subscriptions = new EventEmitter()
    this.prefixChannel = name => 'channel_' + name
    this.store.on('message', this.onStoreMessage.bind(this))
  }

  subscribe (channel, cb) {
    const event = this.prefixChannel(channel)
    this.subscriptions.on(event, cb)
    this.store
      .getLastMessages(channel, this.options.channel_history_size)
      .then(messages => messages.forEach(m => cb(m)))
  }

  unsubscribe (channel, cb) {
    const event = this.prefixChannel(channel)
    this.subscriptions.removeListener(event, cb)
  }

  send (message) {
    message.timestamp = new Date().toUTCString()
    this.store.put(message)
  }

  notify (message) {
    this.store.publish(message)
  }

  onStoreMessage (message) {
    const event = this.prefixChannel(message.channel)
    this.subscriptions.emit(event, message)
  }
}

export default Messenger

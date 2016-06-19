import EventEmitter from 'events'

class Messenger {
  constructor (store) {
    this.store = store
    this.subscriptions = new EventEmitter()
    this.prefixChannel = (name) => ('channel_' + name)
  }

  subscribe (channel, cb) {
    const event = this.prefixChannel(channel)
    this.subscriptions.on(event, cb)
  }

  unsubscribe (channel, cb) {
    const event = this.prefixChannel(channel)
    this.subscriptions.removeListener(event, cb)
  }

  send (message) {
    message.timestamp = new Date().toUTCString()
    const event = this.prefixChannel(message.channel)
    this.subscriptions.emit(event, message)
  }
}

export default Messenger

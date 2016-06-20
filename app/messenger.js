import EventEmitter from 'events'
import config from './config'

/**
 * Messenger class.
 * Must be instantiated once per process.
 * Handles clients subscriptions to channels (using event emitter with channel as event).
 * Transfers messages from clients to messages store and back.
 */
class Messenger {
  /**
   * Class constructor
   * @param store {object} - messages store instance
   * @param options {object} - options, if omitted will be used config
   */
  constructor (store, options) {
    this.store = store
    this.options = options || config.messenger
    this.subscriptions = new EventEmitter()
    this.prefixChannel = name => 'channel_' + name
    this.store.on('message', this.onStoreMessage.bind(this))
  }

  /**
   * Subscribes client callback to specified channel
   * @param channel {string} - channel to subscribe
   * @param cb {function} - callback
   */
  subscribe (channel, cb) {
    const event = this.prefixChannel(channel)
    this.subscriptions.on(event, cb)
    return this.store
      .getLastMessages(channel, this.options.channel_history_size)
      .then(messages => messages.forEach(m => cb(m)))
  }

  /**
   * Cancels channel subscription
   * @param channel {string} - channel to unsubscribe
   * @param cb {function} - callback
   */
  unsubscribe (channel, cb) {
    const event = this.prefixChannel(channel)
    this.subscriptions.removeListener(event, cb)
  }

  /**
   * Sends message to message store
   * @param message {object} - message to send
   */
  send (message) {
    this.store.put(message)
  }

  /**
   * Sends message without storing it
   * @param message {object} - message to send
   */
  notify (message) {
    this.store.publish(message)
  }

  /**
   * Handles new messages from store.
   * @param message {object} - message
   */
  onStoreMessage (message) {
    const event = this.prefixChannel(message.channel)
    this.subscriptions.emit(event, message)
  }
}

export default Messenger

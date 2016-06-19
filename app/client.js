import util from 'util'
import {CMD_MESSAGE, CMD_JOIN_CHANNEL, CMD_SET_NICK,
  messageCommand, sysMessageCommand, sysMessage, message} from './commands'

/**
 * Client class.
 * Uses actor model to serve connected client. Once instantiated with *connection* and *messenger*,
 * it transfers messages from messenger to connection, and handles actions sent from user via
 * *connection*.
 */
class Client {
  /**
   * Class constructor
   * @param connection {object} - websocket connection
   * @param messenger {object} - messenger instance
   */
  constructor (connection, messenger) {
    this.connection = connection
    this.messenger = messenger
    this.channel = this.nick = undefined
    // Prepare callbacks for later use
    this.stopHandler = this.stop.bind(this)
    this.clientActionHandler = this.onClientAction.bind(this)
    this.messangerHandler = this.onMessengerMessage.bind(this)
  }

  /**
   * Start serving.
   * Binds to connection events.
   */
  start () {
    this.connection.on('message', this.clientActionHandler)
    this.connection.on('close', this.stopHandler)
    this.notify('Welcome to the test')
  }

  /**
   * Stop serving.
   * Unbinds from all events and closes connection.
   * My be called directly and on connection close event.
   */
  stop () {
    this.notifyChannel(`${this.nick} disconnected`)
    this.unsubscribe()
    this.connection.removeListener('message', this.clientActionHandler)
    this.connection.removeListener('close', this.stopHandler)
    this.connection.close()
  }

  /**
   * Subscribes to messenger channel.
   * @param channel {string} - channel name to subscribe
   */
  subscribe (channel) {
    if (channel !== this.channel) {
      this.unsubscribe()
      this.channel = channel
      this.notify(`Welcome to channel ${this.channel}, ${this.nick}!`)
      this.notifyChannel(`${this.nick} has joined channel ${this.channel}`)
      this.messenger.subscribe(this.channel, this.messangerHandler)
    }
  }

  /**
   * Cancels current channel subscription
   */
  unsubscribe () {
    if (this.channel !== undefined) {
      this.notifyChannel(`${this.nick} has left channel ${this.channel}`)
      this.messenger.unsubscribe(this.channel, this.messangerHandler)
    }
  }

  /**
   * Notifies user, sends message directly to user
   * not using messenger
   * @param text {string} - text to send
   */
  notify (text) {
    this.connection.send(sysMessageCommand(this.channel, text))
  }

  /**
   * Notifies all people in channel via messenger.
   * @param text {string} - text to send
   */
  notifyChannel (text) {
    this.messenger.notify(sysMessage(this.channel, text))
  }

  /**
   * Messenger new message handler.
   * @param message {object} - message
   */
  onMessengerMessage (message) {
    this.connection.send(messageCommand(
      message.author,
      message.channel,
      message.text,
      message.timestamp
    ))
  }

  /**
   * Handles client actions
   * @param msg {object} - message from connection with command and action properties
   */
  onClientAction (msg) {
    const {command, data} = msg.action
    switch (command) {
      case CMD_MESSAGE:
        this.messenger.send(message(data.author, data.channel, data.text))
        break
      case CMD_JOIN_CHANNEL:
        this.subscribe(data.channel)
        break
      case CMD_SET_NICK:
        this.setNick(data.nick)
        break
      default:
        console.log('Unknown command type from client:', command, util.inspect(data))
    }
  }

  /**
   * Change client nick
   * @param value {string} - new nickname
   */
  setNick (value) {
    if (this.nick !== value) {
      this.notify(`Greetings ${value}!`)
      this.notifyChannel(`${this.nick} renamed to ${value}`)
      this.nick = value
    }
  }

}

export default Client

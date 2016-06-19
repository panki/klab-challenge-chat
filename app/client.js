import util from 'util'
import {CMD_MESSAGE, CMD_JOIN_CHANNEL, CMD_SET_NICK,
  messageCommand, sysMessageCommand, sysMessage} from './commands'

class Client {

  constructor (connection, messenger) {
    this.connection = connection
    this.messenger = messenger
    this.channel = this.nick = undefined
    this.stopHandler = this.stop.bind(this)
    this.clientActionHandler = this.onClientAction.bind(this)
    this.messangerHandler = this.onMessengerMessage.bind(this)
  }

  start () {
    this.connection.on('message', this.clientActionHandler)
    this.connection.on('close', this.stopHandler)
    this.notify('Welcome to the test')
  }

  stop () {
    this.notifyChannel(`${this.nick} disconnected`)
    this.unsubscribe()
    this.connection.removeListener('message', this.clientActionHandler)
    this.connection.removeListener('close', this.stopHandler)
    this.connection.close()
  }

  subscribe (channel) {
    if (channel !== this.channel) {
      this.unsubscribe()
      this.channel = channel
      this.notify(`Welcome to channel ${this.channel}, ${this.nick}!`)
      this.notifyChannel(`${this.nick} has joined channel ${this.channel}`)
      this.messenger.subscribe(this.channel, this.messangerHandler)
    }
  }

  unsubscribe () {
    if (this.channel !== undefined) {
      this.notifyChannel(`${this.nick} has left channel ${this.channel}`)
      this.messenger.unsubscribe(this.channel, this.messangerHandler)
    }
  }

  notify (text) {
    this.connection.send(sysMessageCommand(this.channel, text))
  }

  notifyChannel (text) {
    this.messenger.notify(sysMessage(this.channel, text))
  }

  onMessengerMessage (message) {
    this.connection.send(messageCommand(
      message.author,
      message.channel,
      message.text,
      message.timestamp
    ))
  }

  onClientAction (msg) {
    const {command, data} = msg.action
    switch (command) {
      case CMD_MESSAGE:
        this.messenger.send(data)
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

  setNick (value) {
    if (this.nick !== value) {
      this.notify(`Greetings ${value}!`)
      this.notifyChannel(`${this.nick} renamed to ${value}`)
      this.nick = value
    }
  }

}

export default Client

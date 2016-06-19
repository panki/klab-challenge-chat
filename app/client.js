import util from 'util'
import {CMD_MESSAGE, CMD_JOIN_CHANNEL, CMD_SET_NICK, messageCommand} from './commands'

class Client {

  constructor (connection, messenger) {
    this.connection = connection
    this.messenger = messenger
    this.channel = this.nick = undefined
    this.stopCallback = this.stop.bind(this)
    this.dataCallback = this.onClientMessage.bind(this)
    this.subscribeCallback = this.onMessengerMessage.bind(this)
  }

  start () {
    this.connection.on('message', this.dataCallback)
    this.connection.on('close', this.stopCallback)
  }

  stop () {
    this.unsubscribe()
    this.connection.removeListener('message', this.dataCallback)
    this.connection.removeListener('close', this.stopCallback)
    this.connection.close()
  }

  subscribe (channel) {
    this.unsubscribe()
    this.messenger.subscribe(channel, this.subscribeCallback)
    this.channel = channel
  }

  unsubscribe () {
    if (this.channel !== undefined) this.messenger.unsubscribe(this.channel, this.subscribeCallback)
  }

  onMessengerMessage (message) {
    this.connection.send(messageCommand(message))
  }

  onClientMessage (msg) {
    const {command, data} = msg.action
    switch (command) {
      case CMD_MESSAGE:
        this.messenger.send(data)
        break
      case CMD_JOIN_CHANNEL:
        this.subscribe(data.channel)
        break
      case CMD_SET_NICK:
        this.nick = data.nick
        break
      default:
        console.log('Unknown command type from client:', command, util.inspect(data))
    }
  }

}

export default Client

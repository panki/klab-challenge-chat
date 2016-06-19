import EventEmitter from 'events'

/**
 * Websocket connection wrapper class.
 * Exposes underlying connection methods and events, so it works
 * like original connection but with serialization.
 */
class ConnectionWrapper extends EventEmitter {
  /**
   * Class constructor
   * @param connection {object}- original websocket connection
   * @param codec {object} - codec to encode/decode transferred messages
   */
  constructor (connection, codec) {
    super()
    this.connection = connection
    this.codec = codec
    // wrap message event
    this.connection.on('message', (msg) => this.emit('message', this.codec.unpack(msg.utf8Data)))
    // proxy all other events
    this.connection.on('error', (error) => this.emit('error', error))
    this.connection.on('close', (code, description) => this.emit('close', code, description))
  }

  send (msg) {
    this.connection.sendUTF(this.codec.pack(msg))
  }

  close () {
    this.connection.close()
  }
}

export default ConnectionWrapper

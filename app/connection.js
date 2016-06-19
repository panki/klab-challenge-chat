import EventEmitter from 'events'

class ConnectionWrapper extends EventEmitter {
  constructor (connection, codec) {
    super()
    this.connection = connection
    this.codec = codec
    this.connection.on('message', (msg) => this.emit('message', this.codec.unpack(msg.utf8Data)))
    this.connection.on('close', (code, description) => this.emit('close', code, description))
  }

  send (msg) {
    this.connection.sendUTF(this.codec.pack(msg))
  }

  close () {
    this.connection.close()
  }

  removeListener (event, cb) {
    super.removeListener(event, cb)
    this.connection.removeListener(event, cb)
  }
}

export default ConnectionWrapper

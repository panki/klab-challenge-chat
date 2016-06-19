import {server as WebsocketServer} from 'websocket'
import uuid from 'node-uuid'
import Messenger from './messenger'
import Store from './store'
import Client from './client'
import ConnectionWrapper from './connection'
import {JsonCodec} from './codec'

const store = new Store()
const messenger = new Messenger(store, JsonCodec)

function createWebsocketServer (httpServer) {
  const server = new WebsocketServer({
    httpServer: httpServer,
    autoAcceptConnections: true
  })
  server.on('connect', handleConnection)
  return server
}

function handleConnection (connection) {
  console.log((new Date()) + ' Connection from origin ' + connection.remoteAddress)
  const conn = new ConnectionWrapper(connection, JsonCodec)
  connection.sendUTF('"' + uuid.v4() + '"')
  const client = new Client(conn, messenger)
  client.start()
}

export default createWebsocketServer

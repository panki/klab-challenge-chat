import {server as WebsocketServer} from 'websocket'
import uuid from 'node-uuid'
import Messenger from './../messenger'
import Store from './../store'
import Client from './../client'
import ConnectionWrapper from './connection'
import {JsonCodec} from './../codec'

const store = new Store()
const messenger = new Messenger(store)

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

  // To emulate behaviour of r2d2 protocol, we need to
  // generate id for new connection and send it to client before
  // any other data will be sent
  connection.sendUTF('"' + uuid.v4() + '"')

  // Wrap connection to encode/decode messages
  const conn = new ConnectionWrapper(connection, JsonCodec)

  // For this project we don't need any clients repository, so
  // just create and start it
  const client = new Client(conn, messenger)
  client.start()
}

export default createWebsocketServer

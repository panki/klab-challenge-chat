import express from 'express'
import logger from 'morgan'
import path from 'path'
import httpShutdown from 'http-shutdown'

import routes from './routes'
import websocketServer from './websocket/server'

const app = express()

// Configuration
app.set('views', path.join(__dirname, 'templates'))
app.set('view engine', 'jade')
app.use(logger('combined'))

// Routes
app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(routes)

// Start server
const server = httpShutdown(app.listen(3000, () => {
  var host = server.address().address
  var port = server.address().port
  console.log('Web server is listening on %s:%s', host, port)
}))

// Start websocket server
const ws = websocketServer(server)

// Graceful shutdown
function shutdown (reason, exitCode = 0) {
  console.log(`Terminate on ${reason}`)
  console.log('Cleaning up...')
  console.log('Shutdown websocket server...')
  ws.closeAllConnections()
  console.log('Shutdown web server...')
  server.shutdown(() => {
    console.log('Closed out remaining http connections')
    process.nextTick(() => process.exit(exitCode))
    console.log(`Exiting with code ${exitCode}`)
  })
}

process.once('SIGINT', () => shutdown('Ctrl-C'))
process.once('SIGTERM', () => shutdown('SIGTERM'))
process.once('SIGHUP', () => shutdown('SIGHUP'))
process.once('uncaughtException', (e) => {
  console.log('Uncaught Exception:')
  console.log(e.stack)
  shutdown('Exception', 99)
})


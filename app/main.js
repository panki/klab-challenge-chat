import express from 'express'
import logger from 'morgan'
import path from 'path'

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
const server = app.listen(3000, () => {
  var host = server.address().address
  var port = server.address().port
  console.log('Web server is listening on %s:%s', host, port)
})

// Start websocket server
websocketServer(server)

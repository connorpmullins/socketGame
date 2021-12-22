/** Imports **/
const express = require('express') // Import the Express module
const logger = require('morgan')
const path = require('path') // Import the 'path' module (packaged with Node.js)
const fs = require('fs') // Import the fs
const { Server } = require('socket.io')

const agx = require('./agxgame') // Import the Anagrammatix game file.

/** Database Code **/
const file = 'mydb.db'
const exists = fs.existsSync(file)

if (!exists) {
  console.log('Creating DB file.')
  fs.openSync(file, 'w')
}

const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database(file)

db.serialize(function () {
  if (!exists) {
    db.run('CREATE TABLE player (player_name TEXT, player_win INT)')
  }
})

/** Server Code **/
const app = express() // Create a new instance of Express
const PORT = 3000

app.use(express.static(path.join(__dirname, 'public')))
app.use(logger('dev'))

const server = app.listen(PORT)

const io = new Server(server)

// Listen for Socket.IO Connections. Once connected, start the game logic.
io.sockets.on('connection', (socket) => {
  // console.log('client connected')
  agx.initGame(io, socket, db)
})

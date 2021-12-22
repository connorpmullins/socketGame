const express = require('express')
const path = require('path')
const { Server } = require('socket.io')
const game = require('./public/game')

const app = express()
const PORT = 3000

app.use(express.static(path.join(__dirname, 'public')))
// app.use(express.static('public'))

const server = app.listen(PORT, () => {
  console.log('app.listen')
})

const io = new Server(server)

io.sockets.on('connection', (socket) => {
  game.initGame(io, socket)
})

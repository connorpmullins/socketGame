const express = require('express')
const path = require('path')
const { Server } = require('socket.io')
const game = require('../src/game')

const app = express()
const PORT = 3000

app.use(express.static(path.join(__dirname, '..', 'dist')))
app.use(express.static('public'))

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'))
})

const server = app.listen(PORT, () => {
  console.log('server')
})
const io = new Server(server)

io.sockets.on('connection', (socket) => {
  game.initGame(io, socket)
})

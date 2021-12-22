let io
let gameSocket

exports.initGame = function (ioServer, socket) {
  console.log('initGame')
  io = ioServer
  gameSocket = socket
  gameSocket.emit('connected', { message: 'You are connected!' })

  // Client Events
  gameSocket.on('clientCreateNewGame', clientCreateNewGame)
  gameSocket.on('clientRoomFull', clientPrepareGame)
  gameSocket.on('clientCountdownFinished', clientStartGame)
  // gameSocket.on('clientNextRound', dummy)

  // User Events
  gameSocket.on('userJoinGame', userJoinGame)
  gameSocket.on('userAnswer', userAnswer)
  gameSocket.on('userRestart', userRestart)
}

/**
 * The 'START' button was clicked and 'clientCreateNewGame' event occurred.
 */
function clientCreateNewGame () {
  // Create unique Socket.IO room
  const thisGameId = Math.random() * 10000

  this.emit('newGameCreated', { gameId: thisGameId, mySocketId: this.id })

  this.join(thisGameId.toString())
}

/*
 * Two users have joined. Alert the client!
 * @param gameId The game ID / room ID
 */
function clientPrepareGame (gameId) {
  const sock = this
  const data = {
    mySocketId: sock.id,
    gameId: gameId
  }
  io.sockets.in(data.gameId).emit('beginNewGame', data)
}

function clientStartGame (gameId) {
  console.log('game started')
  // sendWord(0, gameId)
}

/**
 * A user clicked the 'START GAME' button.
 * Attempt to connect them to the room that matches
 * the gameId entered by the user.
 * @param data Contains data entered via user's input - userName and gameId.
 */
function userJoinGame (data) {
  console.log('User ' + data.userName + 'attempting to join game: ' + data.gameId)

  // A reference to the user's Socket.IO socket object
  const sock = this

  // Look up the room ID in the Socket.IO manager object.
  const room = gameSocket.manager.rooms['/' + data.gameId]

  // If the room exists...
  if (room) {
    // attach the socket id to the data object.
    data.mySocketId = sock.id

    // Join the room
    sock.join(data.gameId)

    console.log('User ' + data.userName + ' joining game: ' + data.gameId)

    // Emit an event notifying the clients that the user has joined the room.
    io.sockets.in(data.gameId).emit('userJoinedRoom', data)
  } else {
    // Otherwise, send an error message back to the user.
    this.emit('error', { message: 'This room does not exist.' })
  }
}

/**
 * A user has tapped a word in the word list.
 * @param data gameId
 */
function userAnswer (data) {
  // console.log('User ID: ' + data.userId + ' answered a question with: ' + data.answer);

  // The user's answer is attached to the data object.  \
  // Emit an event with the answer so it can be checked by the 'Host'
  // io.sockets.in(data.gameId).emit('hostCheckAnswer', data)
}

/**
 * The game is over, and a user has clicked a button to restart the game.
 * @param data
 */
function userRestart (data) {
  console.log('user: ' + data.userName + ' ready for new game.')

  // Emit the user's data back to the clients in the game room.
  data.userId = this.id
  io.sockets.in(data.gameId).emit('userJoinedRoom', data)
}

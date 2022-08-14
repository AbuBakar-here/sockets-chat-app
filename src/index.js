const express = require("express")
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require("bad-words")
const { generateMessage, generateLocationMessage } = require('./utils/messages')

const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

// Constants
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000

// Define Paths for Express config
const publicPath = path.join(__dirname, '../public/')



// Express Use
app.use(express.static(publicPath))


// Socket.io Events

io.on('connection', (socket) => {
    console.log('new web socket connection!')

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin', 'Welcome to our Chat App'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('userMessage', (clientMessage, callback) => {
        const filter = new Filter()

        if (filter.isProfane(clientMessage)){
            return callback('Profanity is not allowed!')
        }

        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(user.username, clientMessage))
        callback()
    })

    socket.on('sendLocation', (pos, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${pos.latitude},${pos.longitude}`))
        callback()
    })

    socket.on('typing-sent', (userTyped) => {
        const user = getUser(socket.id)

        if (userTyped) {
            // console.log(userTyped)
            return socket.broadcast.to(user.room).emit('typing-recieved', true, user.username)
        }
        socket.broadcast.to(user.room).emit('typing-recieved', false, user.username)
    })



    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`))

            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }  
    })
})















server.listen(port, () => {
    console.log('Server is up on port ' + port +'!')
})
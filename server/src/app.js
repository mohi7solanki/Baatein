const express = require('express')
const bodyParser = require('body-parser')
// const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
const user = require('./routes/user')
const chat = require('./routes/chat')
var Message = require('./models/Message.js')
const session = require('express-session')({
  secret: 'my-secret',
  resave: true,
  saveUninitialized: true
})
const app = express()
var sharedsession = require('express-socket.io-session')
var storedsockets = {}
var storedclients = {}

app.use(session)
var server = require('http').createServer(app)

var io = require('socket.io')(server)

io.use(sharedsession(session, {
  autoSave: true
}))
// socket io
io.on('connection', function (socket) {
  console.log('User connected')
  console.log(socket.handshake.session.user)
  if (socket.handshake.session.user) {
    storedsockets[socket.handshake.session.user['_id']] = socket
    storedclients[socket.id] = socket.handshake.session.user['_id']
  }
  socket.on('disconnect', function () {
    console.log('User disconnected')
    if (socket in storedclients) {
      var clientid = storedclients[socket.id]
      delete storedsockets[clientid]
      delete storedclients[socket.id]
    }
  })
})
server.listen(4000)
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token')
  next()
})
// app.use(cors())
app.use('/user', user)
app.use('/users', user)
app.use('/chat', chat)
app.post('/send/:to', function (req, res, next) {
  console.log('size:' + Object.keys(storedsockets).length)
  Object.keys(storedsockets).forEach(function (key) {
    console.log(key)
  })
  var sess = req.session
  if (!sess.user) {
    res.json('Please Login First')
    return
  }
  var from = sess.user._id
  var to = req.params.to
  var message = req.body.message
  var temp = new Message({ from: from, to: to, data: message })
  temp.save(function (err) {
    if (err) res.json(err.errmsg)
    else {
      // if (storedsockets[from]) {
      //   console.log('socket from')
      //   storedsockets[from].emit('new-message', temp)
      // }
      if (storedsockets[to]) {
        console.log('socket to')
        storedsockets[to].emit('new-message', temp)
      }
      res.json(temp)
    }
  })
})

mongoose.Promise = global.Promise

mongoose.connect('mongodb://localhost/mean-chat')
  .then(() => console.log('connection successful'))
  .catch((err) => console.error(err))

app.listen(process.env.PORT || 8082)

const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
const user = require('./routes/user')
const chat = require('./routes/chat')
var Message = require('./models/Message.js')
var User = require('./models/User')
// Configuring the session
const session = require('express-session')({
  secret: 'my-secret',
  resave: true,
  saveUninitialized: true,
  expires: new Date(Date.now() + 120000)
})

const app = express()

var sharedsession = require('express-socket.io-session')
var storedsockets = {}
var storedclients = {}

app.use(express.static(path.join(__dirname, '..', '..', 'dist')))
app.use(session)

var server = require('http').createServer(app)

var io = require('socket.io')(server)

io.use(sharedsession(session, {
  autoSave: true
}))

// socket io
io.on('connection', function (socket) {
  if (socket.handshake.session.user) {
    storedsockets[socket.handshake.session.user['_id']] = socket
    storedclients[socket.id] = socket.handshake.session.user['_id']
  }
  socket.on('disconnect', function () {
    if (socket in storedclients) {
      var clientid = storedclients[socket.id]
      delete storedsockets[clientid]
      delete storedclients[socket.id]
    }
  })
})
server.listen(4000)

// Logging request details
app.use(morgan('combined'))

// extract the entire body portion of an incoming request stream and exposes it on req.body
app.use(bodyParser.json())

// Allow cors
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token')
  next()
})

app.use('/user', user)
app.use('/users', user)
app.use('/chat', chat)

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '..', '..', 'dist', 'index.html'))
})

// Get all users
app.get('/users', function (req, res, next) {
  User.find({}, function (err, users) {
    let userMap = []
    users.forEach(function (user) {
      userMap.push(user)
    })
    console.log(userMap)
    res.send(userMap)
    console.log(err)
  })
})

app.post('/send/:to', function (req, res, next) {
  var sess = req.session
  if (!sess.user) {
    res.status(400)
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
      if (storedsockets[to]) {
        // if that user is using baatein on other tab
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

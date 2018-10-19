// var User = require('../models/User.js')
var express = require('express')
var router = express.Router()
var app = express()
var server = require('http').createServer(app)
var io = require('socket.io')(server)
var Message = require('../models/Message.js')

server.listen(4000)

// socket io
io.on('connection', function (socket) {
  console.log('User connected')
  socket.on('disconnect', function () {
    console.log('User disconnected')
  })
  socket.on('save-message', function (data) {
    console.log(data)
    io.emit('new-message', { message: data })
  })
})

/* GET ALL CHATS */
router.get('/show/:pb', function (req, res, next) {
  var sess = req.session
  if (!sess.user) {
    res.json('Please Login First')
    return
  }
  var pa = sess.user._id
  var pb = req.params.pb
  Message.find({
    $or: [
      { $and: [ { from: pa }, { to: pb } ] },
      { $and: [ { to: pa }, { from: pb } ] }
    ]
  }, function (err, messages) {
    if (err) return next(err)
    res.json(messages)
  })
})

router.post('/add/:to', function (req, res, next) {
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
    else res.json(temp)
  })
  //    if(clients[selfid])
  //      clients[selfid].emit('new-message', { data: message, from:selfid, to:otherid});
  //    if(clients[otherid])
  //      clients[otherid].emit('new-message', { data: message, from:selfid, to:otherid});
})

module.exports = router

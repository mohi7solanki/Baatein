var express = require('express')
var router = express.Router()

var Message = require('../models/Message.js')

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

module.exports = router

var express = require('express')
var router = express.Router()
var User = require('../models/User')

// Register request
router.post('/register', function (req, res, next) {
  let username = req.body.username
  let password = req.body.password
  var temp = new User({
    username: username,
    password: password
  })
  temp.save(function (err) {
    if (err) {
      res.send(400)
      res.json(err.errmsg)
    } else res.json(temp)
  })
})

// Signin request
router.post('/signin', function (req, res, next) {
  let sess = req.session
  let username = req.body.username
  let password = req.body.password
  console.log(username + password)
  User.findOne({
    username: username
  }, function (err, user) {
    if (err) return next(err)
    if (user && user.password === password) {
      sess.user = user
      return res.json(sess)
    } else {
      return res.status(400).send({
        message: 'Invalid username or password'
      })
    }
  })
})

// Logout request
router.get('/logout', function (req, res) {
  var sess = req.session
  console.log(sess)
  if (!sess.user) {
    res.json('Please Login First')
    return
  }
  req.session.destroy(function (err) {
    if (err) {
      res.status(400)
    } else {
      res.json('Logout Success')
    }
  })
})

// Check if a user is still logeedin
router.get('/isloggedin', function (req, res, next) {
  let sess = req.session
  // res.json(sess)
  // console.log(sess.user)
  if (!sess.user) {
    res.status(400)
    res.send('False')
  } else res.send(sess.user)
})

// Get all users
router.get('/', function (req, res, next) {
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

module.exports = router

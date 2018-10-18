var express = require('express')
var router = express.Router()
var User = require('../models/User')
/* GET ALL CHATS */
router.post('/register', function (req, res, next) {
  console.log('1')
  let username = req.body.username
  let password = req.body.password
  console.log(username + password)
  var temp = new User({
    username: username,
    password: password
  })
  temp.save(function (err) {
    if (err) res.json(err.errmsg)
    else res.json(temp)
  })
})
router.post('/signin', function (req, res, next) {
  console.log('signin')
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
      res.json(sess)
    } else {
      res.json('Invalid username or password')
    }
  })
})
router.get('/isloggedin', function (req, res, next) {
  let sess = req.session
  res.json(sess)
  // console.log(sess.user)
  if (!sess.user) {
    res.json('False')
    return
  }
  res.json(sess.user)
})
// router.get('/', function(req, res, next) {
//     username = req.param.username;
//     password = req.param.password;
//     User.find({},function(err, users){
//         if (err) return next(err);
//         res.json(users);
//     });
// });
// router.get('/find/:uname', function(req, res, next) {
//     username = req.params.uname;
//     User.findOne({username:username},function(err, user){
//         if (err) return next(err);
//         res.json(user);
//     });
// });
// router.get('/logout',function(req,res){
//     var sess = req.session;
//     if(!sess.user){res.json("Please Login First");return;}
//     req.session.destroy(function(err) {
//         if(err) {
//             console.log(err);
//         } else {
//             res.json("Logout Success");
//         }
//     });
// });
module.exports = router

const express = require('express')
const bodyParser = require('body-parser')
// const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
const register = require('./routes/user')
const session = require('express-session')
const app = express()
let MemoryStore = session.MemoryStore

app.use(session({
  name: 'chat-app',
  secret: '1234567890QWERTY',
  resave: true,
  store: new MemoryStore(),
  saveUninitialized: false
}))
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
app.use('/user', register)

mongoose.Promise = global.Promise

mongoose.connect('mongodb://localhost/mean-chat')
  .then(() => console.log('connection successful'))
  .catch((err) => console.error(err))

app.listen(process.env.PORT || 8082)

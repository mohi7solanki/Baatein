var mongoose = require('mongoose')

var MessageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  data: String
})

module.exports = mongoose.model('Message', MessageSchema)

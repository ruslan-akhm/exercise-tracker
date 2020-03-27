const mongoose = require('mongoose')

var Schema = mongoose.Schema

var userSchema = new Schema({
  //_id: mongoose.Schema.Types.ObjectId,
  username: String,
  _id: String,
  count: Number,
  log: [Object]
})

var User = mongoose.model("User", userSchema)

module.exports = User;
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')


const user = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String }
})

user.plugin(passportLocalMongoose)

const User = mongoose.model('User', user)

module.exports = User
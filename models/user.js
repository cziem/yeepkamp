const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')

const social = new Schema({
  name: String,
  url: String
})

const user = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String },
  isAdmin: { type: Boolean, default: false },
  avatar: String,
  firstName: String,
  lastName: String,
  email: String,
  website: String,
  socials: [social],
  status: String
})

user.plugin(passportLocalMongoose)

const User = mongoose.model('User', user)

module.exports = User
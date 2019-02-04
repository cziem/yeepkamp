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
  avatarId: String,
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, required: true },
  website: String,
  facebook: String,
  twitter: String,
  instagram: String,
  status: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date
})

user.plugin(passportLocalMongoose)

const User = mongoose.model('User', user)

module.exports = User
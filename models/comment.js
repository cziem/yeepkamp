const mongoose = require('mongoose')
const Schema = mongoose.Schema

const comment = new Schema({
  text: String,
  author: String,
  createdAt: { type: Date, default: Date.now().toLocaleString() }
})

const Comment = mongoose.model('Comment', comment)

module.exports = Comment
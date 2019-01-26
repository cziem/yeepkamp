const mongoose = require('mongoose')
const Schema = mongoose.Schema

const comment = new Schema({
  text: { type: String, trim: true },
  author: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  },
  createdAt: { type: Date, default: Date.now }
})

const Comment = mongoose.model('Comment', comment)

module.exports = Comment
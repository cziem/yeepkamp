const mongoose = require('mongoose')
const Schema = mongoose.Schema

const yelpKamp = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  desc: String,
  price: String,
  author: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment"
    }
  ]
})

const Campground = mongoose.model('YelpKamp', yelpKamp)

module.exports = Campground
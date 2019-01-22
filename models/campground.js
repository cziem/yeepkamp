const mongoose = require('mongoose')
const Schema = mongoose.Schema

const yelpKamp = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  desc: String,
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "comment"
    }
  ]
})

const Campground = mongoose.model('YelpKamp', yelpKamp)

module.exports = Campground
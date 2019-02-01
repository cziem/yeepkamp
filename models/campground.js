const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Comment = require('./comment')

const yelpKamp = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  imageId: String,
  desc: String,
  price: Number,
  location: String,
  lat: Number,
  lng: Number,
  createdAt: { type: Date, default: Date.now },
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

yelpKamp.pre('remove', async function(next) {
  try {
    await Comment.remove({
      "_id": {
        $in: this.comments
      }
    })
    next()
  } catch (err) {
    next(err)
  }
})

const Campground = mongoose.model('YelpKamp', yelpKamp)

module.exports = Campground
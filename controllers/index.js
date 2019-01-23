const passport = require('passport')
const localStrategy = require('passport-local')

const Campgrounds = require('../models/campground')
const Comment = require('../models/comment')
const User = require('../models/user')

passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

module.exports = {
  home: (req, res) => {
    res.render('landing')
  },

  // Get all the campgrounds
  getCampground: (req, res) => {
    Campgrounds.find()
      .then((campGrounds) => {
        res.render('index', { campGrounds })
      })
  },

  // Add new campground form
  getNewCampground: (req, res) => {
    res.render('addCampground')
  },

  // Add a new campground
  addCampground: (req, res) => {
    const { name, image, desc } = req.body

    const campground = new Campgrounds({
      name,
      image,
      desc
    })

    campground.save()
      .then(() => res.redirect('/campgrounds'))
      .catch(err => console.log(`an error occurred... ${err}`))
  },

  // Show details about a single campground
  showCampground: (req, res) => {
    const id = req.params.id 

    Campgrounds.findById(id).populate('comments')
      .then((campground) => {
        res.render('show', { campground })
      })
      .catch(err => console.log(`an error occurred... ${err}`))    
  },

  // Delete a campground
  removeCampground: (req, res) => {
    const id = req.params.id

    Campgrounds.findOneAndRemove(id)
      .then(() => {
        res.redirect('/campgrounds')
      })
      .catch(err => {
        console.log(`Failed to delete, an error occurred: ${err}`)
      })
  },

  // Add New Comment
  addComment: (req, res) => {
    // render add new comment form
    const id = req.params.id
    Campgrounds.findById(id)
      .then(campground => {
        res.render('comments', { campground })
      })
      .catch(err => {
        console.log(`an error has occurred... ErrorMessage: ${err}`)
      })
  },

  // Create New Comment
  createComment: (req, res) => {
    // Create new comment
    const campId = req.params.id
    const comment = req.body.comment

    Campgrounds.findById(campId)
      .then((campground) => {
        Comment.create(comment)
          .then(newComment => {
            campground.comments.push(newComment)
            campground.save()
            console.log(campground)
            res.redirect(`/campgrounds/${campground._id}`)
          })
      })
      .catch(err => {
        res.redirect('/campgrounds')
        console.log(`could not add comment, Error: ${err}`)
      })
  }
}
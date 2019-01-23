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
        res.render('index', { 
          campGrounds
         })
      })
  },

  // Add new campground form
  getNewCampground: (req, res) => {
    res.render('addCampground')
  },

  // Add a new campground
  addCampground: (req, res) => {
    const { name, image, desc } = req.body

    const author = {
      id: req.user._id,
      username: req.user.username
    }

    const campground = new Campgrounds({
      name,
      image,
      desc,
      author
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

  // Edit a campground form
  editCampground: (req, res) => {
    const campId = req.params.id

    Campgrounds.findById(campId)
      .then(campground => {
        res.render('edit', { campground })
      })
  },

  // Handle Edit campground request
  updateCampground: (req, res) => {
     const campId = req.params.id 
     const updateInfo = req.body.campground

     Campgrounds.findByIdAndUpdate(campId, updateInfo)
      .then(campground => {
        res.redirect(`/campgrounds/${campground._id}`)
      })
      .catch(() => {
        res.render('edit')
      })
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

  // Edit Comment
  editComment: (req, res) => {
    const { comment_id, id } = req.params

    Campgrounds.findById(id)
      .then(campground => {
        Comment.findById(comment_id)
          .then(comment => {
            res.render('editComments', { 
              campground,
              comment
             })
          })
      })
      .catch(() => {
        res.redirect('back')
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
            newComment.author.id = req.user._id
            newComment.author.username = req.user.username
            newComment.save()

            campground.comments.push(newComment)
            campground.save()
            
            res.redirect(`/campgrounds/${campground._id}`)
          })
      })
      .catch(err => {
        res.redirect('/campgrounds')
        console.log(`could not add comment, Error: ${err}`)
      })
  },

  // Update Comment
  updateComment: (req, res) => {
    const { comment_id, id } = req.params
    comment = req.body.comment

    Comment.findByIdAndUpdate(comment_id, comment)
      .then(() => {
        res.redirect(`/campgrounds/${id}`)
      })
      .catch(() => {
        res.redirect('back')
      })
  },

  // Delete Comment
  deleteComment: (req, res) => {
    res.send('deleting')
  },

  // AUTH LOGICS
  newSignup: (req, res) => {
    res.render('signup')
  },

  // Handle Signup
  addSignup: (req, res) => {
    const { username, password } = req.body

    User.register(new User({ username }), password)
      .then(user => {
        passport.authenticate('local')(req, res, () => {
          res.redirect('/campgrounds')
        })
      })
      .catch(err => {
        console.log(`Could not sign up new user. Error: ${err}`)
        res.render('signup')
      })
  },  

  // Show login form
  showLogin: (req, res) => {
    res.render('login')
  },

  // Handle Login request
  login: passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/login'
  }),

  // logout user
  logout: (req, res) => {
    req.logout()
    res.redirect('/campgrounds')
  }
}
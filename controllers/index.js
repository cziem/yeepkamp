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
    const { name, image, desc, price } = req.body

    const author = {
      id: req.user._id,
      username: req.user.username
    }

    const campground = new Campgrounds({
      name,
      price,
      image,
      desc,
      author
    })

    campground.save()
      .then(() => {
        req.flash('success', `Created ${campground.name} successfully`)
        res.redirect('/campgrounds')
      })
      .catch(err => {
        req.flash('error', 'Bad Request! Could not create campground')
        res.redirect('/campgrounds')
      })
  },

  // Show details about a single campground
  showCampground: (req, res) => {
    const id = req.params.id 

    Campgrounds.findById(id).populate('comments')
      .then((campground, err) => {
        if (err || !campground) {
          return res.flash('error', 'Could not locate resource...')
        }
        res.render('show', { campground })
      })
      .catch(err => {
        req.flash('error', 'Could not locate resource...')
        res.redirect('/campgrounds')
      })    
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
        req.flash('success', `Updated ${campground.name} successfully`)
        res.redirect(`/campgrounds/${campground._id}`)
      })
      .catch(() => {
        res.render('edit')
      })
  },

  // Delete a campground
  removeCampground: (req, res) => {
    const id = req.params.id

    Campgrounds.findById(id)
      .then((campground) => {
        campground.remove()
        req.flash('success', `Removed campground successfully`)
        res.redirect('/campgrounds')
      })
      .catch(err => {
        req.flash('error', 'Could not delete campground')
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
        req.flash('warn', 'Please ensure you have the right access')
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
        req.flash('error', 'Could not find the campground')
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
        req.flash('success', 'You updated your comment')
        res.redirect(`/campgrounds/${id}`)
      })
      .catch(() => {
        res.redirect('back')
      })
  },

  // Delete Comment
  deleteComment: (req, res) => {
    const { comment_id, id } = req.params

    Comment.findByIdAndRemove(comment_id)
      .then(() => {
        req.flash('success', 'You deleted your comment')
        res.redirect(`/campgrounds/${id}`)
      })
      .catch(() => {
        res.redirect('back')
      })
  },

  // AUTH LOGICS
  newSignup: (req, res) => {
    res.render('signup')
  },

  // Handle Signup
  addSignup: (req, res) => {
    let newUser = new User({ username: req.body.username })
    const { password } = req.body

    if (req.body.adminCode === process.env.ADMIN_CODE) {
      newUser.isAdmin = true
    }

    User.register(newUser, password)
      .then(user => {
        passport.authenticate('local')(req, res, () => {
          req.flash('success', `Successfully signed up. Good to meet you ${user.username}`)
          res.redirect('/campgrounds')
        })
      })
      .catch(err => {
        req.flash('error', err.message)
        return res.render('signup')
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
    req.flash('success', `See you soon...`)
    res.redirect('/campgrounds')
  },

  // USER PROFILE
  showPublicProfile: (req, res) => {
    const username = req.params.username 

    User.findOne({ username })
      .then(user => {
        Campgrounds
          .find()
          .where('author.id')
          .equals(user._id)
          .then(campgrounds => {
            res.render('users/profile', { user, campgrounds })
          })
      })
      .catch(err => {
        req.flash('error', `Could not find ${username}`)
      })

  }
}
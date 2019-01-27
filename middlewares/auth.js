const Campgrounds = require('../models/campground')
const Comment = require('../models/comment')

module.exports = { 
  isLoggedIn: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    } else {
      req.flash('error', 'Please login first...')
      res.redirect('/login')
    }
  },
  isOwner: (req, res, next) => {
    const campId = req.params.id

    if (req.isAuthenticated()) {
      Campgrounds.findById(campId)
      .then(campground => {
        // is user owner of campground
        if (campground.author.id.equals(req.user._id) || req.user.isAdmin) {
          next()
        } else {
          req.flash('error', 'You are not authorized for that')
          res.redirect('back')
        }
      })
      .catch(() => {
        req.flash('warn', 'Could not find the resource you looked up...')
        res.redirect('back')
      })
    } else {
      req.flash('error', 'Please login first...')
      res.redirect('back')
    }
  },
  isCommentOwner: (req, res, next) => {
    const { comment_id } = req.params

    if (req.isAuthenticated()) {
      Comment.findById(comment_id)
      .then(comment => {
        // is user owner of campground
        if (comment.author.id.equals(req.user._id) || req.user.isAdmin) {
          next()
        } else {
          req.flash('error', 'You are not authorized for that')
          res.redirect('back')
        }
      })
      .catch(() => {
        req.flash('warn', 'Could not find the resource you looked up...')
        res.redirect('back')
      })
    } else {
      req.flash('error', 'Please login first...')
      res.redirect('back')
    }
  }
}
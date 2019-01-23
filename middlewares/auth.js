const Campgrounds = require('../models/campground')
const Comment = require('../models/comment')

module.exports = { 
  isLoggedIn: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    } else {
      res.redirect('/login')
    }
  },
  isOwner: (req, res, next) => {
    const campId = req.params.id

    if (req.isAuthenticated()) {
      Campgrounds.findById(campId)
      .then(campground => {
        // is user owner of campground
        if (campground.author.id.equals(req.user._id)) {
          next()
        } else {
          res.redirect('back')
        }
      })
      .catch(() => {
        res.redirect('back')
      })
    } else {
      res.redirect('back')
    }
  },
  isCommentOwner: (req, res, next) => {
    const { comment_id } = req.params

    if (req.isAuthenticated()) {
      Comment.findById(comment_id)
      .then(comment => {
        // is user owner of campground
        if (comment.author.id.equals(req.user._id)) {
          next()
        } else {
          res.redirect('back')
        }
      })
      .catch(() => {
        res.redirect('back')
      })
    } else {
      res.redirect('back')
    }
  }
}
const express = require('express')
const router = express.Router()

const controller = require('../controllers/index')

router.get('/', controller.home)

// Campground Routes
router.get('/campgrounds', controller.getCampground)

// Add new campground
router.post('/campgrounds', controller.addCampground)

// Generate form to add new campground
router.get('/campgrounds/new', controller.getNewCampground)

// Show a single campground
router.get('/campgrounds/:id', controller.showCampground)

// Delete a campground
router.post('/campgrounds/:id', controller.removeCampground)

// Add New Comment
router.get('/campgrounds/:id/comments/new', controller.addComment)

// Create Comment
router.post('/campgrounds/:id/comments', controller.createComment)

// AUTH ROUTES
// Show signup form
router.get('/signup', controller.newSignup)

// Handle signup details
router.post('/signup', controller.addSignup)

// Show login form
router.get('/login', controller.showLogin)

// Login user
// ======================
// This does not work from here...
router.post('/login', controller.login)

// Why doesn't it work?
// ====================

// THIS ONE WORKS FROM HERE
router.post('login',  passport.authenticate('local', {
  successRedirect: '/campgrounds',
  failureRedirect: '/login'
}))

// Logout user
router.get('/logout', controller.logout)

module.exports = router
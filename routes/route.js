const express = require('express')
const router = express.Router()

const controller = require('../controllers/index')
const isLoggedIn = require('../middlewares/auth')

router.get('/', controller.home)

// Campground Routes
router.get('/campgrounds', controller.getCampground)

// Add new campground
router.post('/campgrounds', isLoggedIn, controller.addCampground)

// Generate form to add new campground
router.get('/campgrounds/new', isLoggedIn, controller.getNewCampground)

// Show a single campground
router.get('/campgrounds/:id', controller.showCampground)

// Edit a campground form
router.get('/campgrounds/:id/edit', isLoggedIn,  controller.editCampground)

// Handle Edit campground form
router.put('/campgrounds/:id/', isLoggedIn,  controller.updateCampground)

// Delete a campground
router.delete('/campgrounds/:id', isLoggedIn,  controller.removeCampground)

// Add New Comment
router.get('/campgrounds/:id/comments/new', isLoggedIn,  controller.addComment)

// Create Comment
router.post('/campgrounds/:id/comments', isLoggedIn,  controller.createComment)

// AUTH ROUTES
// Show signup form
router.get('/signup', controller.newSignup)

// Handle signup details
router.post('/signup', controller.addSignup)

// Show login form
router.get('/login', controller.showLogin)

// Login user
router.post('/login', controller.login)

// Logout user
router.get('/logout', controller.logout)

module.exports = router
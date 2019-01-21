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

module.exports = router
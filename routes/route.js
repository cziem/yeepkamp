const express = require('express')
const router = express.Router()

const controller = require('../controllers/index')

router.get('/', controller.home)

// Campground Routes
router.get('/campgrounds', controller.getCampground)
router.post('/campgrounds', controller.addCampground)
router.get('/campgrounds/new', controller.getNewCampground)
router.get('/campgrounds/:id', controller.showCampground)

module.exports = router
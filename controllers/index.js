const Campgrounds = require('../models/schema')

module.exports = {
  home: (req, res) => {
    res.render('landing')
  },

  // Get all the campgrounds
  getCampground: (req, res) => {
    Campgrounds.find()
      .then((campGrounds) => {
        res.render('campgrounds', { campGrounds })
      })
  },

  // Add new campground form
  getNewCampground: (req, res) => {
    res.render('addCampground')
  },

  // Add a new campground
  addCampground: (req, res) => {
    const { addCampground, image } = req.body

    const campground = new Campgrounds({
      name: addCampground,
      image
    })

    campground.save()
      .then(() => res.redirect('/campgrounds'))
      .catch(err => console.log(`an error occurred... ${err}`))
  }
}
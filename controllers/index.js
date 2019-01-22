const Campgrounds = require('../models/campground')

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

    Campgrounds.findById(id)
      .then(campground => {
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
  }
}
module.exports = {
  home: (req, res) => {
    res.render('landing')
  },
  getCampground: (req, res) => {
    const campGrounds = [
      { name: "Rangers Mount", imgScr: "https://pixabay.com/get/e837b1072af4003ed1584d05fb1d4e97e07ee3d21cac104491f7c878aeebb3b9_340.jpg" },
      { name: "Caulra Frost", imgScr: "https://pixabay.com/get/e834b5062cf4033ed1584d05fb1d4e97e07ee3d21cac104491f7c878aeebb3b9_340.jpg" },
      { name: "Gilards Front", imgScr: "https://farm4.staticflickr.com/3492/3823130660_0509aa841f.jpg" },
      { name: "Melrads Pikes", imgScr: "https://farm2.staticflickr.com/1363/1342367857_2fd12531e7.jpg" },
      { name: "Bramble Bee", imgScr: "https://farm2.staticflickr.com/1424/1430198323_c26451b047.jpg" }
    ]

    res.render('campgrounds', { campGrounds })
  },
  addCampground: (req, res) => {
    res.render('addCampground')
  }
}
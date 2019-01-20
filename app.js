const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.send('yelp kamp')
})


app.listen(port, () => console.log(`Yelpkamp is running on localhost://${port}`))
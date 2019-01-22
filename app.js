const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const app = express()
const port = process.env.PORT || 3000
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/yelpkamp"

// connect mongoose
mongoose.connect(uri, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: true
})
  .then(() => console.log('connected to the database...'))
  .catch(err => console.log(`an error occurred: ${err}`))


// Require Routes
const routes = require('./routes/route')

app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.use('/', routes)


app.listen(port, () => console.log(`Yelpkamp is running on localhost://${port}`))
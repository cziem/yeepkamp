const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = process.env.PORT || 3000

// Require Routes
const routes = require('./routes/route')

app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')

app.use('/', routes)


app.listen(port, () => console.log(`Yelpkamp is running on localhost://${port}`))
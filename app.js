require('dotenv').config()
const  express         = require('express'),
      bodyParser      = require('body-parser'),
      mongoose        = require('mongoose'),
      passport        = require('passport'),
      methodOverride  = require('method-override'),
      flash           = require('connect-flash')

const app = express()
const port = process.env.PORT || 3000
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/yelpkamp"
const secret = process.env.APP_SECRET

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

// CONFIGURE PASSPORT
app.use(require('express-session')({
  secret: secret,
  resave: false,
  saveUninitialized: false
}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(passport.initialize())
app.use(passport.session())
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
app.use(methodOverride("_method"))
app.use(flash())

// pass current user to every page and route
app.use((req, res, next) => {
  res.locals.currentUser = req.user
  res.locals.error = req.flash("error")
  res.locals.warn = req.flash("warn")
  res.locals.success = req.flash("success")
  next()
})

app.use('/', routes)


app.listen(port, () => console.log(`Yelpkamp is running on localhost://${port}`))
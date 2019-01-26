require('./config/config')
const  express         = require('express'),
      bodyParser      = require('body-parser'),
      mongoose        = require('mongoose'),
      passport        = require('passport'),
      methodOverride  = require('method-override'),
      flash           = require('connect-flash')

const app = express()
const port = process.env.PORT
const uri = process.env.MONGODB_URI
const secret = process.env.APP_SECRET

// connect mongoose
mongoose.connect(uri, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useFindAndModify: true
})
  .then(() => console.log(`connected to the database... @ ${uri}`))
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
app.locals.moment = require('moment')

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
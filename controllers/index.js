require('../config/config')
const passport = require('passport')
const localStrategy = require('passport-local')
const NodeGeocoder = require("node-geocoder");
const cloudinary = require("cloudinary");
const async = require('async')
const nodemailer = require('nodemailer')
const crypto = require('crypto')

// Option Configs
const options = {
  provider: "google",
  httpAdapter: "https",
  apiKey: process.env.API_KEY,
  formatter: null
};

const geocoder = NodeGeocoder(options);

// Configure Cloudinary
cloudinary.config({
  cloud_name: "techam",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Require Models
const Campgrounds = require('../models/campground')
const Comment = require('../models/comment')
const User = require('../models/user')

passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// Export the Route handling Logics
module.exports = {
  home: (req, res) => {
    res.render('landing')
  },

  // Get all the campgrounds
  getCampground: (req, res) => {
    const search = req.query.search
    
    if (search) {
      const regex = new RegExp(escapeRegex(search), "gi")

      Campgrounds.find({ name: regex })
        .then(campGrounds => {
          if (campGrounds.length < 1) {
            req.flash('error', 'No match for your query')
            res.redirect('/campgrounds')
          } else {
            res.render('index', { campGrounds })
          }
        })
    } else {
      Campgrounds.find()
        .then((campGrounds) => {
          res.render('index', { 
            campGrounds
           })
        })
    }
    
  },

  // Add new campground form
  getNewCampground: (req, res) => {
    res.render('campgrounds/addCampground')
  },

  // Add a new campground
  addCampground: (req, res) => {
    // const { name, image, desc, price } = req.body

    const author = {
      id: req.user._id,
      username: req.user.username
    }

    const userLocation = req.body.campground.location

    // Geocoder
    geocoder.geocode(userLocation)
      .then(data => {
        
        if (!data.length) {
          req.flash('error', "Invalid Address")
          return res.redirect('back')
        }

        const lat = data[0].latitude
        const lng = data[0].longitude
        const location = data[0].formattedAddress

        cloudinary.v2.uploader
          .upload(req.file.path, { moderation: "webpurify" })
          .then(result => {
            req.body.campground.image = result.secure_url;
            req.body.campground.imageId = result.public_id;
            req.body.campground.author = author;
            req.body.campground.location = location;
            req.body.campground.lat = lat;
            req.body.campground.lng = lng;

            const campground = new Campgrounds(req.body.campground);

            campground
              .save()
              .then(() => {
                req.flash(
                  "success",
                  `Created ${campground.name} successfully`
                );
                res.redirect(`/campgrounds/${campground._id}`);
              })
              .catch(err => {
                req.flash(
                  "error",
                  "Bad Request! Could not create campground"
                );
                res.redirect("/campgrounds");
              });
          })
          .catch(err => {
            req.flash("error", "Could not upload image...");
            res.redirect("/campgrounds");
          });
      })
      .catch((err) => {
        req.flash('error', "Bad Location Address provided")
        res.redirect('back')
      })
  },

  // Show details about a single campground
  showCampground: (req, res) => {
    const id = req.params.id 

    Campgrounds.findById(id).populate('comments')
      .then((campground, err) => {
        if (err || !campground) {
          return res.flash('error', 'Could not locate resource...')
        }
        res.render('show', { campground })
      })
      .catch(err => {
        req.flash('error', 'Could not locate resource...')
        res.redirect('/campgrounds')
      })    
  },

  // Edit a campground form
  editCampground: (req, res) => {
    const campId = req.params.id

    Campgrounds.findById(campId)
      .then(campground => {
        res.render('campgrounds/edit', { campground })
      })
  },

  // Handle Edit campground request
  updateCampground: (req, res) => {
     const campId = req.params.id 
     let updateInfo = req.body.campground
     
     // Geocoder
     geocoder.geocode(updateInfo.location)
     .then(data => {
       
        if (!data.length) {
          req.flash('error', "Invalid Address")
          return res.redirect('back')
        }
        
        const lat = data[0].latitude
        const lng = data[0].longitude
        const location = data[0].formattedAddress
        
        updateInfo.lat = lat
        updateInfo.lng = lng
        updateInfo.location = location
       
        Campgrounds.findById(campId, async (err, campground) => {
         if (err) {
           req.flash("error", err.message);
           res.redirect("back");
         } else {
           if (req.file) {
             try {
               await cloudinary.v2.uploader.destroy(campground.imageId);
               let result = await cloudinary.v2.uploader.upload(
                 req.file.path,
                 { moderation: "webpurify" }
               );
               campground.imageId = result.public_id;
               campground.image = result.secure_url;
             } catch (err) {
               req.flash("error", err.message);
               return res.redirect("back");
             }
           }
           
           campground.name = updateInfo.name
           campground.price = updateInfo.price
           campground.desc = updateInfo.desc
           campground.location = updateInfo.location
           campground.save();
           
           req.flash("success", "Successfully Updated!");
           res.redirect("/campgrounds/" + campground._id);
         }
       })
      })
      .catch((err) => {
        console.log(err)
        req.flash('error', "Bad Address provided")
        res.redirect('back')
      })
  },

  // Delete a campground
  removeCampground: (req, res) => {
    const id = req.params.id

    Campgrounds.findById(id)
      .then( async (campground) => {
        await cloudinary.v2.uploader.destroy(campground.imageId);
        campground.remove()
        req.flash('success', `Removed campground successfully`)
        res.redirect('/campgrounds')
      })
      .catch(err => {
        req.flash('error', 'Could not delete campground')
        console.log(`Failed to delete, an error occurred: ${err}`)
      })
  },

  // Add New Comment
  addComment: (req, res) => {
    // render add new comment form
    const id = req.params.id
    Campgrounds.findById(id)
      .then(campground => {
        res.render('comments/comments', { campground })
      })
      .catch(err => {
        req.flash('warn', 'Please ensure you have the right access')
        console.log(`an error has occurred... ErrorMessage: ${err}`)
      })
  },

  // Edit Comment
  editComment: (req, res) => {
    const { comment_id, id } = req.params

    Campgrounds.findById(id)
      .then(campground => {
        Comment.findById(comment_id)
          .then(comment => {
            res.render('comments/editComments', { 
              campground,
              comment
             })
          })
      })
      .catch(() => {
        req.flash('error', 'Could not find the campground')
        res.redirect('back')
      })

  },

  // Create New Comment
  createComment: (req, res) => {
    // Create new comment
    const campId = req.params.id
    const comment = req.body.comment

    Campgrounds.findById(campId)
      .then((campground) => {
        Comment.create(comment)
          .then(newComment => {
            newComment.author.id = req.user._id
            newComment.author.username = req.user.username
            newComment.save()

            campground.comments.push(newComment)
            campground.save()
            
            res.redirect(`/campgrounds/${campground._id}`)
          })
      })
      .catch(err => {
        res.redirect('/campgrounds')
        console.log(`could not add comment, Error: ${err}`)
      })
  },

  // Update Comment
  updateComment: (req, res) => {
    const { comment_id, id } = req.params
    comment = req.body.comment

    Comment.findByIdAndUpdate(comment_id, comment)
      .then(() => {
        req.flash('success', 'You updated your comment')
        res.redirect(`/campgrounds/${id}`)
      })
      .catch(() => {
        res.redirect('back')
      })
  },

  // Delete Comment
  deleteComment: (req, res) => {
    const { comment_id, id } = req.params

    Comment.findByIdAndRemove(comment_id)
      .then(() => {
        req.flash('success', 'You deleted your comment')
        res.redirect(`/campgrounds/${id}`)
      })
      .catch(() => {
        res.redirect('back')
      })
  },

  // AUTH LOGICS
  newSignup: (req, res) => {
    res.render('signup')
  },

  // Handle Signup
  addSignup: (req, res) => {
    const newUser = new User({ 
      username: req.body.username,
      email: req.body.email
    })
    const { password } = req.body

    if (req.body.adminCode === process.env.ADMIN_CODE) {
      newUser.isAdmin = true
    }

    User.register(newUser, password)
      .then(user => {
        passport.authenticate('local')(req, res, () => {
          req.flash('success', `Successfully signed up. Good to meet you ${user.username}`)
          res.redirect('/campgrounds')
        })
      })
      .catch(err => {
        req.flash('error', err.message)
        return res.render('signup')
      })
  },  

  // Show login form
  showLogin: (req, res) => {
    res.render('login')
  },

  // Handle Login request
  login: passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/login'
  }),

  // logout user
  logout: (req, res) => {
    req.logout()
    req.flash('success', `See you soon...`)
    res.redirect('/campgrounds')
  },

  // USER PROFILE
  showPublicProfile: (req, res) => {
    const username = req.params.username 

    User.findOne({ username })
      .then(user => {
        Campgrounds
          .find()
          .where('author.id')
          .equals(user._id)
          .then(campgrounds => {
            res.render('users/profile', { user, campgrounds })
          })
      })
      .catch(err => {
        req.flash('error', `Could not find ${username}`)
      })

  },

  // Edit Users Profile Form
  editProfile: async (req, res) => {
    try {
      let user = await User.findById(req.params.id)
      res.render('users/edit', { user })
    } catch (error) {
      req.flash('error', 'BAD REQUEST: No user with such credentials')   
      res.redirect('back')
    }
  },

  updateProfile: async (req, res) => {
    const profileData = req.body.user
    const profilePic = req.file.path

    try {
      let proUser = await User.findById(req.params.id)
      
      if (proUser) {
        if (proUser.avatar) {
          await cloudinary.v2.uploader.destroy(proUser.avatarId);
        }
        let result = await cloudinary.v2.uploader.upload(profilePic, {
          moderation: "webpurify"
        });
        profileData.avatarId = result.public_id;
        profileData.avatar = result.secure_url;

        // Update user's records
        let user = await User.findOneAndUpdate(req.params.id, profileData, { new: true })
        req.flash('success', 'Updated data successfully...')
        res.redirect(`/users/${user.username}`)
      }
    } catch (error) {
      req.flash('error', 'Could not update information...')
      res.redirect('/campgrounds')
    }
  },

  // Forgot Password
  forgotPassword: (req, res) => {
    res.render('users/forgot')
  },

  recoverPassword: (req, res, next) => {
    async.waterfall([
      (done) => {
        crypto.randomBytes(20, (err, buf) => {
          const token = buf.toString('hex');
          done(err, token);
        });
      },

      (token, done) => {
        User.findOne({ email: req.body.email }, (err, user) => {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot-password');
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save((err) => {
            done(err, token, user);
          });
        });
      },

      (token, user, done) => {
        const smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: 'techampinc@gmail.com',
            pass: process.env.GMAILPW
          }
        });

        const mailOptions = {
          to: user.email,
          from: 'techampinc@gmail.com',
          subject: 'YeepKamp Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };

        smtpTransport.sendMail(mailOptions, (err) => {
          console.log('mail sent');
          req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], (err) => {
      if (err) return next(err);
      res.redirect('/forgot-password');
    });
  },

  // Render form for updating password
  resetPasswordForm: (req, res) => {
    User.findOne({ 
      resetPasswordToken: req.params.token, 
      resetPasswordExpires: { $gt: Date.now() } 
    }, (err, user) => {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot-password');
      }
      res.render('users/reset', { token: req.params.token });
    });
  },

  // Handle forgot password request
  resetPassword: (req, res, next) => {
    async.waterfall([
      (done) => {
        User.findOne({ 
          resetPasswordToken: req.params.token, 
          resetPasswordExpires: { $gt: Date.now() } 
        }, 
         (err, user) => {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }

          if (req.body.password === req.body.confirm) {
            user.setPassword(req.body.password, (err) => {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;

              user.save((err) => {
                req.logIn(user, (err) => {
                  done(err, user);
                });
              });
            })
          } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
          }
        });
      },
      (user, done) => {
        const smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: 'techampinc@gmail.com',
            pass: process.env.GMAILPW
          }
        });

        const mailOptions = {
          to: user.email,
          from: 'techampinc@mail.com',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };

        smtpTransport.sendMail(mailOptions, (err) => {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], (err) => {
      res.redirect('/campgrounds');
    });
  }
}

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};
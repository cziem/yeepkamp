require("../config/config");
const express = require('express')
const multer = require("multer");
const router = express.Router()

const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

const imageFilter = function (req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFilter });

const controller = require('../controllers/index')
const { isLoggedIn, isOwner, isCommentOwner } = require('../middlewares/auth')

router.get('/', controller.home)

// Campground Routes
router.get('/campgrounds', controller.getCampground)

// Add new campground
router.post(
  '/campgrounds', 
  isLoggedIn, 
  upload.single('image'), 
  controller.addCampground
)

// Generate form to add new campground
router.get(
  '/campgrounds/new', 
  isLoggedIn, 
  controller.getNewCampground
)

// Show a single campground
router.get('/campgrounds/:id', controller.showCampground)

// Edit a campground form
router.get(
  '/campgrounds/:id/edit', 
  isOwner,  
  controller.editCampground
)

// Handle Edit campground form
router.put(
  "/campgrounds/:id/",
  isOwner,
  upload.single("image"),
  controller.updateCampground
);

// Delete a campground
router.delete(
  '/campgrounds/:id', 
  isOwner,  
  controller.removeCampground
)

// Add New Comment
router.get(
  '/campgrounds/:id/comments/new',
  isLoggedIn,
  controller.addComment
)

// Create Comment
router.post(
  '/campgrounds/:id/comments',
  isLoggedIn,
  controller.createComment
)

// Edit Comment 
router.get(
  '/campgrounds/:id/comments/:comment_id/edit',
  isCommentOwner,
  controller.editComment
)

// Update Comment 
router.put(
  '/campgrounds/:id/comments/:comment_id',
  isCommentOwner,
  controller.updateComment
)

// Delete Comment
router.delete(
  '/campgrounds/:id/comments/:comment_id', 
  isCommentOwner,
  controller.deleteComment
)

// AUTH ROUTES
// Show signup form
router.get('/signup', controller.newSignup)

// Handle signup details
router.post('/signup', controller.addSignup)

// Show login form
router.get('/login', controller.showLogin)

// Login user
router.post('/login', controller.login)

// Logout user
router.get('/logout', controller.logout)

// USER PROFILE
router.get('/users/:username', controller.showPublicProfile)

// Edit user profile data Form
router.get(
  '/users/:id/edit', 
  isLoggedIn,
  controller.editProfile
)

// Handle profile edit request
router.put(
  '/users/:id', 
  isLoggedIn,
  upload.single('image'),
  controller.updateProfile
)

// Forgot Password
router.get('/forgot-password', controller.forgotPassword)

// Handle Forgot Password Request
router.post('/forgot-password', controller.recoverPassword)

// Reset Password
router.get('/reset/:token', controller.resetPasswordForm)

// Reset Password
router.post('/reset/:token', controller.resetPassword)

module.exports = router
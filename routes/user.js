const express = require('express')
const router = express.Router()
const passport = require('passport')

const UserController = require('../controllers/UserController.js')

router.post('/register', UserController.register)
router.post('/login', UserController.login)
router.get(
  '/profile',
  passport.authenticate('jwt', { session: false }),
  UserController.profile
)

module.exports = router

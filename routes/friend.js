const express = require('express')
const router = express.Router()
const passport = require('passport')

const FriendController = require('../controllers/FriendController.js')

router.get(
  '',
  passport.authenticate('jwt', { session: false }),
  FriendController.search
)
router.post(
  '',
  passport.authenticate('jwt', { session: false }),
  FriendController.add
)

module.exports = router

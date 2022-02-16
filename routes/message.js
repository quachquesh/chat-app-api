const express = require('express')
const router = express.Router()
const passport = require('passport')

const MessageController = require('../controllers/MessageController')

router.get(
  '/:friendId',
  passport.authenticate('jwt', { session: false }),
  MessageController.getMessages
)

module.exports = router

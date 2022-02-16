const UserRouter = require('./user.js')
const FriendRouter = require('./friend.js')
const MessageRouter = require('./message.js')

function route(app) {
  app.use('/user', UserRouter)
  app.use('/friends', FriendRouter)
  app.use('/messages', MessageRouter)
  app.all('/', (req, res) => {
    res.json({
      message: 'RESTful API server',
    })
  })
}

module.exports = route

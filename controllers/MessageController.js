let Friend = require('../models/FriendModel')

class MessageController {
  async getMessages(req, res) {
    let userId = req.user._id
    let friendId = req.params.friendId

    let friend = await Friend.findOne(
      {
        $or: [
          { user: userId, friend: friendId },
          { user: friendId, friend: userId },
        ],
      },
      {
        messages: {
          $slice: -30,
        },
      }
    )
      .populate('friend', '-password')
      .populate('user', '-password')

    let messages = friend.messages

    let user = null
    if (friend.user._id + '' == userId) {
      user = friend.friend
    } else {
      user = friend.user
    }
    res.json({ messages, user })
  }
}

module.exports = new MessageController()

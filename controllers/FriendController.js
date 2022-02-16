let Friend = require('../models/FriendModel')
let User = require('../models/UserModel')

class FriendController {
  async search(req, res) {
    let search = req.query.search
    if (search !== undefined) {
      if (search.length > 0) {
        // ne = not equal
        const users = await User.find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { username: { $regex: search, $options: 'i' } },
          ],
        })
          .ne('_id', req.user.id)
          .select('_id name username')
        res.json(users)
      } else {
        res.json([])
      }
    } else {
      const friends = await Friend.find({
        $or: [{ user: req.user._id }, { friend: req.user._id }],
      })
        .populate('friend', '-password')
        .populate('user', '-password')
        .slice('messages', -1)
      res.json(friends)
    }
  }
  async add(req, res) {
    let friendId = req.body.friendId
    if (friendId !== undefined) {
      const friend = await Friend.findOne({
        user: req.user.id,
        friend: friendId,
      })
      if (friend === null) {
        const friend = new Friend({
          user: req.user.id,
          friend: friendId,
        })
        let newFriend = await friend.save()
        // get info new friend
        newFriend.friend = await User.findOne(
          { _id: friendId },
          '_id name username'
        )
        newFriend.user = req.user
        res.json(newFriend)
      } else {
        res.json({
          message: 'Bạn đã kết bạn với người này rồi',
        })
      }
    } else {
      res.json({
        message: 'friendId is required',
      })
    }
  }
}

module.exports = new FriendController()

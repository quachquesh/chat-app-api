const mongoose = require('mongoose')
const Schema = mongoose.Schema

const messageSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'users' },
    receiver: { type: Schema.Types.ObjectId, ref: 'users' },
    content: String,
    readed: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

const friendSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'users' },
    friend: { type: Schema.Types.ObjectId, ref: 'users' },
    messages: [messageSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

module.exports = mongoose.model('friends', friendSchema)

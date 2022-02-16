const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema(
  {
    name: String,
    username: String,
    password: String,
    isOnline: Boolean,
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

// module.exports = mongoose.models.users || mongoose.model('users', userSchema)
module.exports = mongoose.model('users', userSchema)

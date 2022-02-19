const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isOnline: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// module.exports = mongoose.models.users || mongoose.model('users', userSchema)
module.exports = mongoose.model('users', userSchema);

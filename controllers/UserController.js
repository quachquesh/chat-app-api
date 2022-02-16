let User = require('../models/UserModel');
// const passport = require('passport')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

class UserController {
  async login(req, res) {
    const data = req.body;
    const user = await User.findOne({ username: data.username });
    if (user) {
      bcrypt.compare(data.password, user.password, function (err, result) {
        if (result) {
          const token = jwt.sign(user.toObject(), 'secret', {
            expiresIn: '2h',
          });
          let decode = jwt.verify(token, 'secret');
          // console.log(decode)
          res.set('Token_Exp', decode.exp * 1000);
          res.json({
            status: true,
            message: 'Thành công',
            token: token,
            token_exp: decode.exp * 1000,
          });
        } else {
          res.json({
            status: false,
            message: 'Sai tài khoản hoặc mật khẩu.',
          });
        }
      });
    } else {
      res.json({
        status: false,
        message: 'Sai tài khoản hoặc mật khẩu.',
      });
    }
  }

  async register(req, res) {
    const data = req.body;
    const user = await User.findOne({ username: data.username });
    if (user) {
      res.json({
        status: false,
        message: 'Username đã tồn tại',
      });
    } else {
      bcrypt.hash(data.password, saltRounds, async function (err, hash) {
        data.password = hash;
        const userNew = await User.create(data);
        res.json({
          status: true,
          message: 'Thành công',
          data: userNew,
        });
      });
    }
  }

  async profile(req, res) {
    let user = req.user;
    // console.log(user)
    res.json(user);
  }
}

module.exports = new UserController();

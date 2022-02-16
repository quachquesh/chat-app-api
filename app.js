const express = require('express');
var cors = require('cors');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

const mongoose = require('mongoose');

const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

let User = require('./models/UserModel');
let Friend = require('./models/FriendModel');

// setup passport
var opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'secret',
};
passport.use(
  new JwtStrategy(opts, function (jwt_payload, done) {
    User.findOne(
      { _id: jwt_payload._id },
      '-password',
      {},
      function (err, user) {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
          // or you could create a new account
        }
      }
    );
  })
);

passport.serializeUser(function (user, done) {
  if (user) done(null, user);
});

passport.deserializeUser(function (id, done) {
  done(null, id);
});

const route = require('./routes');
const { callbackify } = require('util');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const mongodbUrl =
  'mongodb+srv://nqtrung:FAft9lJLRwgWUyCc@cluster0.le3x9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const mongodb = process.env.PRODUCTION
  ? mongodbUrl
  : 'mongodb://localhost:27017/chat-app';

mongoose
  .connect(mongodbUrl)
  .then(() => console.log('Kết nối database thành công'))
  .catch((err) => console.log(err));

// route init
route(app);

// socket io init
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://nqt-chat-app.herokuapp.com'],
  },
});

// socket io auth passport-jwt
const wrapMiddlewareForSocketIo = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

io.use(wrapMiddlewareForSocketIo(passport.initialize()));
io.use(wrapMiddlewareForSocketIo(passport.authenticate(['jwt'])));

// socket io event
io.on('connection', (socket) => {
  console.log('new socket connection');
  console.log(socket.id);
  let user = socket.request.user;
  console.log('join: ', user._id.toString());
  socket.join(user._id.toString());

  // gửi tin nhắn
  socket.on('send-message', (data, callback) => {
    let message = {
      user: user._id,
      receiver: data.receiver,
      content: data.content,
    };

    Friend.findOneAndUpdate(
      {
        $or: [
          { user: user._id, friend: data.receiver },
          { user: data.receiver, friend: user._id },
        ],
      },
      {
        $push: { messages: message },
      },
      { new: true },
      async (err, friend) => {
        if (err) {
          // báo lỗi cho người gửi
          socket.emit('send-message', {
            status: false,
            message: 'Lỗi gửi tin nhắn',
          });
        } else {
          // trả tin nhắn về cho người gửi
          callback({
            status: true,
            message: friend.messages[0],
          });
          // Gửi tin nhắn tới người nhận
          socket.to(data.receiver).emit('receiver-message', friend.messages[0]);
        }
      }
    ).slice('messages', -1);
  });

  // đọc tin nhắn
  socket.on('read-message', async (callback) => {
    // const message = await Message.findOneAndUpdate(
    //   { receiver: user._id },
    //   { readed: true },
    //   { new: true }
    // ).populate('user', '-password')
    // if (message.readed) {
    //   // trả tin nhắn về cho người gửi
    //   callback({
    //     status: true,
    //     message: message,
    //   })
    //   // Gửi tin nhắn tới người nhận
    //   socket.to(message.user._id).emit('readed-message', message)
    // }
  });

  socket.on('user-online', async (data) => {
    // cập nhất status user online
    user = await User.findOneAndUpdate(
      { _id: user._id },
      { isOnline: true },
      { new: true }
    ).select('-password');

    // Lấy danh sách bạn bè online
    const friends = await Friend.find({
      $or: [{ user: user._id }, { friend: user._id }],
    })
      .populate('friend', '-password')
      .populate('user', '-password')
      .ne('user.isOnline', false)
      .ne('friend.isOnline', false)
      .select('-messages')
      .exec();

    // Thông báo online cho user khác
    friends.forEach(async (friend) => {
      if (friend.user._id.toString() == user._id) {
        socket.to(friend.friend._id.toString()).emit('user-online', user);
      } else if (friend.friend._id.toString() == user._id) {
        socket.to(friend.user._id.toString()).emit('user-online', user);
      }
    });
  });

  // socket.emit('connected', {
  //   message: 'Welcome to the chat app',
  //   user,
  // })

  socket.conn.on('close', async () => {
    // Cập nhật user offline
    user = await User.findOneAndUpdate(
      { _id: user._id },
      { isOnline: false },
      { new: true }
    ).select('-password');
    // Lấy danh sách bạn bè online
    const friends = await Friend.find({
      $or: [{ user: user._id }, { friend: user._id }],
    })
      .populate('friend', '-password')
      .populate('user', '-password')
      .ne('user.isOnline', false)
      .ne('friend.isOnline', false)
      .select('-messages')
      .exec();
    // Thông báo offline cho user khác
    friends.forEach(async (friend) => {
      if (friend.user._id.toString() == user._id) {
        socket.to(friend.friend._id.toString()).emit('user-offline', user);
      } else if (friend.friend._id.toString() == user._id) {
        socket.to(friend.user._id.toString()).emit('user-offline', user);
      }
    });
  });
});

module.exports = app;

// if (require.main === module) {
//   const port = 3001
//   app.listen(port, () => {
//     // eslint-disable-next-line no-console
//     console.log(`API server listening on port 3001`)
//   })
// }

server.listen(3001, () => {
  console.log('listening on *:3001');
});

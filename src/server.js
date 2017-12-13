const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model('User', UserSchema);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/bcrypt-users', {
  useMongoClient: true,
});

const port = 3000;
const server = express();
server.use(bodyParser.json());

/* ************ Helper Functions/Constants ***************** */
const STATUS_USER_ERROR = 422;
const STATUS_SERVER_ERROR = 500;

const sendUserError = (msg, res) => {
  if (typeof msg === 'object') {
    res.status(STATUS_SERVER_ERROR);
    res.json(msg);
    return;
  }
  res.status(STATUS_SERVER_ERROR);
  res.json({ error: msg });
  return;
};

/* ************ MiddleWares ***************** */
const hashedPassword = (req, res, next) => {
  const { password } = req.body;
  bcrypt
    .hash(password, 11)
    .then((pw) => {
      req.password = pw;
      next();
    })
    .catch((err) => {
      throw new Error(err);
    });
};

const authenticate = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err) {
      res.status(422);
      res.json({ 'Need both Email/PW fields': err.message });
      return;
    }
    const hashedPw = user.password;
    bcrypt
      .compare(password, hashedPw)
      .then((res) => {
        if (!res) throw new Error();
        req.loggedInUser = user;
        next();
      })
      .catch((err) => {
        return sendUserError('some message here', res);
      });
  });
};

server.post('/user/login', authenticate, (req, res) => {
  res.json({ success: `${req.loggedInUser.email} logged in` });
});

server.post('/user/new', hashedPassword, (req, res) => {
  const { email } = req.body;
  const password = req.password;
  const newUser = new User({ email, password });
  newUser.save((err, savedUser) => {
    if (err) {
      res.status(422);
      res.json({ 'Need both Email/PW fields': err.message });
      return;
    }
    res.json({ savedUser });
  });
});

server.listen(port, () => {
  console.log(`server listening on port ${port}`);
});

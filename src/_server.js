const bodyParser = require('body-parser');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');

// const port = 3000;

const STATUS_USER_ERROR = 422;
const STATUS_SERVER_ERROR = 500;
const BCRYPT_COST = 11;

const server = express();
// to enable parsing of json bodies for post requests
// server.use(bodyParser.json());
// server.use(
//   session({
//     secret: 'e5SPiqsEtjexkTj3Xqovsjzq8ovjfgVDFMfUzSmJO21dtXs4re',
//   }),
// );

/** ********* MiddleWare *********************** */

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

server.post('/user/new', hashedPassword, (req, res) => {
  const { email } = req.body;
  const password = req.password;
  const newUser = new User({ email, password });
  newUser.save((err, savedUser) => {
    if (err) {
      res.status(422);
      res.json({ 'Need both email and password fields': err.message });
      return;
    }
    res.json({ savedUser });
  });
});

// server.listen(port, () => {
//   console.log(`Server Listening on port ${port}`);
// });

/* Sends the given err, a string or an object, to the client. Sets the status
 * code appropriately. */
const sendUserError = (err, res) => {
  if (typeof msg === 'object') {
    res.status(STATUS_SERVER_ERROR);
    res.json(msg);
    return;
  }
  res.status(STATUS_SERVER_ERROR);
  res.json({ error: msg });
  return;
};

// TODO: implement routes

// TODO: add local middleware to this route to ensure the user is logged in
server.get('/me', (req, res) => {
  // Do NOT modify this route handler in any way.
  res.json(req.user);
});

module.exports = { server };

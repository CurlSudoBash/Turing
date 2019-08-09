var express = require('express');
var router = express.Router();
const userModel = require('../models/userModel');

/* GET home page. */
router.get('/', function(req, res, next) {
  return res.render('home');
});

router.get('/login', function(req, res, next) {
  if (res.session.login) {
    return res.render('home');
  }
  const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  const email = req.body.email;
  const password = req.body.password;

  if (!re.test(String(email).toLowerCase())) {
    return res.render('login');
  }
  userModel.fetchOrSaveUser({ email, password }).then((user) => {
    return res.render('home');
  }).catch((err) => {
    console.log("Error during login");
    return res.render('login');
  })

});

module.exports = router;

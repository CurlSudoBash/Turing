var express = require('express');
var router = express.Router();
const userModel = require('../models/userModel');

/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.session.login) {
    return res.redirect('/login');
  }
  return res.render('ra/dashboard');
});

router.get('/login', function(req, res, next) {
  return res.render('auth/signin');
})

router.get('/signup', function(req, res, next) {
  return res.render('auth/signup');
})

router.post('/login', function(req, res, next) {
  if (req.session.login) {
    return res.redirect('/');
  }
  const re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  const _id = req.body.username;
  const password = req.body.password;

  if (!re.test(String(_id).toLowerCase())) {
    //return res.render('auth/signin');
  }
  userModel.fetchUser({ _id, password }).then((user) => {
    if (!user) {
      return res.redirect('/login');
    } else {
      req.session.login = true;
      res.redirect('/');
    }
  }).catch((err) => {
    console.log("Error during login");
    return res.redirect('/login');
  })
});

router.post('/signup', function(req, res, next) {
  if (req.session.login) {
    return res.redirect('/');
  }

  const _id = req.body.username;
  const password = req.body.password;

  userModel.saveUser({ _id, password }, (status) => {
    if (!status) {
      return res.redirect('/signup');
    }
    return res.redirect('/');
  });
});

module.exports = router;

var express = require('express');
var router = express.Router();
var passport = require('../config/passport');
const mysql = require("mysql");

let client = mysql.createConnection({
  user: "root",
  password: "password",
  database: "da"
})
module.exports = router;

// Home
router.get('/', function(req, res){
  res.render('home/welcome');
});
router.get('/about', function(req, res){
  res.render('home/about');
});
router.get('/story', function(req, res){
  res.render('home/story');
});
router.get('/member', function(req, res){
  res.render('home/member');
});
router.get('/posts4', function(req, res){
  res.render('home/posts4');
});

// Login
router.get('/login', function (req,res) {
  var username = req.flash('username')[0];
  var errors = req.flash('errors')[0] || {};
    res.render('home/login', {
      username:username,
      errors:errors
    });
});

//Post Login
router.post('/login',
  function(req,res,next){
    var errors = {};
    var isValid = true;
    var cnt_sql = "insert into Counter (day, User_cnt) values (curdate(), User_cnt+1) ON DUPLICATE KEY UPDATE day=curdate(), User_cnt=User_cnt+1;";
    if(!req.body.username){
      isValid = false;
      errors.username = 'Username is required!';
    }
    if(!req.body.password){
      isValid = false;
      errors.password = 'Password is required!';
    }
    client.query(cnt_sql, [isValid, errors], function(){
      if(isValid){
        next();
      }
      else {
        req.flash('errors',errors);
        res.redirect('/login');
      }
    });
  },
  passport.authenticate('local-login', {
    successRedirect : '/',
    failureRedirect : '/login',
    failureFlash: true
  }
));

// Logout
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

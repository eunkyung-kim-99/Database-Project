var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const mysql = require("mysql");
var msg = require ('dialog');

const client = mysql.createConnection({
  host: 'localhost',
  user: "root",
  password: "password",
  database: "da"
})

// serialize & deserialize User
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});

// local strategy
passport.use('local-login',
  new LocalStrategy({
      usernameField : 'username',
      passwordField : 'password',
      session: true,
      passReqToCallback : true
    },
    function(req, username, password, done) {
    var sql = 'SELECT * FROM user WHERE id = ? AND pw = ?';
    client.query(sql, [username, password],
      function(err, datas) {
      if(datas.length) {
        return done(null, {
        id: username
      });
    }else{
      msg.info ("존재하지 않는 아이디입니다.");
      return done(null, false);
    }
    })
  }));


module.exports = passport;

var express = require('express');
var router = express.Router();
const mysql = require("mysql");
var msg = require ('dialog');

let client = mysql.createConnection({
  user: "root",
  password: "password",
  database: "da"
})

module.exports = router;

// New
router.get('/new', function(req, res){
  client.query("SELECT * FROM user;", function(err, result, fields){
   if(err){
     console.log("쿼리문에 오류가 있습니다.");
   }
   else{
     res.render('users/new', {
       results: result
     });
   }
 });
});


//delete
router.get('/manage/:id', function(req, res){
  var id = req.params.id;
  client.query('delete from user where id=?', [id], function(err, rows) {
        if(err){
          console.error(err);
        }
        else{
          res.redirect('/users/manage');
        }
    });
  });

router.get('/manage', function(req, res){
  client.query("SELECT * FROM user;", function(err, result, fields){
   if(err){
     console.log("쿼리문에 오류가 있습니다.");
   }
   else{
     res.render('users/manage', {
       results: result
     });
   }
 });
});

//search
router.post('/search', function(req, res, next) {
  var body = req.body;
    client.query("SELECT * FROM user where id=?;", [body.searchText],
    function(err, result, fields){
      if(result.length){
        res.render('users/manage', {
          results: result
        });
      }
      else{
        msg.info ("아이디가 존재하지 않습니다.");
      }
    });
  });

// create
router.post('/', function(req, res){
  var body = req.body;
  var a ="";
  if(body.username == a || body.password == a || body.name == a || body.gender == a || body.address == a || body.birth == a || body.email == a || body.phone == a){
msg.info ("모든 정보를 입력해주세요.");
    } else{
//      if(body.username.length>4 && body.password.l)
  client.query("SELECT * FROM user WHERE id=? OR name =? OR phone=?",
  [body.username, body.name, body.phone], function(err, result, fields){
    if(result.length == 0){
      client.query("INSERT INTO user (id, pw, name, gender, address, birth, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [body.username, body.password, body.name, body.gender, body.address, body.birth, body.email, body.phone],
      function(){
          res.redirect("/login");
        });
      } else{
        msg.info ("이미 존재하는 정보입니다.");
        }
});
}
});

//show
router.get('/', function(req, res, done){
  if(isAuthenticated){
      var sql = 'SELECT * FROM user WHERE id=?';
      client.query(sql, [req.session.passport.user.id],
        function(err, result, fields) {
        if(err) return done(err);
        else{
          res.render('users/show', { data: result,
          user: req.user
        });
        }
      })
    }
  else{
    res.render('/login');
  }
  });


  //show2
  router.get('/:id', function(req, res, done){
    var id = req.params.id;

    if(isAuthenticated){
        var sql = 'SELECT * FROM user WHERE id=?';
        client.query(sql, [id],
          function(err, result, fields) {
          if(err) return done(err);
          else{
            res.render('users/show2', {
              data: result,
              user: req.user
          });
          }
        })
      }
    else{
      res.render('/login');
    }
    });

var isAuthenticated = function(req, res, next) {
  if(req.isAuthenticated())
    return next();
  res.redirect('/login');
};

//edit
router.get('/edit/:id', function(req, res, done){
  var id = req.params.id;
  if(isAuthenticated){
  var sql = 'SELECT * FROM user WHERE id=?';
  client.query(sql, [id],
    function(err, result, fields) {
    if(err) return done(err);
    else{
      res.render('users/edit', { data: result,
      user: req.user
    });
    }
  })
}
else{
  res.render('/login');
}
});

// update
router.put('/', function(req, res, next){
  var body = req.body;
  var a = "";
  if(body.password == a || body.gender == a || body.address == a || body.birth == a || body.email == a || body.phone == a){
    msg.info ("모든 정보를 입력하세요.");
  } else{
client.query("update user SET pw=?, gender=?, address=?, birth=?, email=?, phone=? WHERE id=?", [
body.newPassword, body.gender, body.address, body.birth, body.email, body.phone, req.session.passport.user.id],
function(){
  res.redirect('/');
});
}
});


module.exports = router;

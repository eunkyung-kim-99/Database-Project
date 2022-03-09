var express  = require('express');
var router = express.Router();
const mysql = require("mysql");   // mysql 모듈 require
var msg = require ('dialog');

let client = mysql.createConnection({
  user: "root",
  password: "password",
  database: "DA"
})

// create
router.post('/', function(req, res){
  var apply = res.locals.apply;

  req.body.author = req.user._id;
  req.body.apply = apply._id;

  Comment2.create(req.body, function(err, comment2){
    if(err){
      req.flash('comment2Form', { _id:null, form:req.body });
      req.flash('comment2Error', { _id:null, parentComment2:req.body.parentComment2, errors:util.parseError(err) });
    }
    return res.redirect('/applys/'+apply._id+res.locals.getApplyQueryString());
  });
});

// update
router.post('/edit/:RNO/:CNO', function(req, res){
  var CNO = req.params.CNO;
  var RNO = req.params.RNO;
  var a = "";
  var sql = "update r_comment set content=?, day=now() WHERE CNO=?";
  if(req.body.text == a){
msg.info ("댓글을 입력해주세요.");
  }else{
  client.query(sql, [req.body.text, CNO], function(err, result, fields){
      if(err){
        console.error(err);
      }
      else{
        res.redirect('/applys/show/'+ RNO);
      }
  });
}
});

// destroy
router.get('/delete/:CNO/:RNO', function(req, res){
  var CNO = req.params.CNO;
  var RNO = req.params.RNO;

  client.query('delete from r_comment where CNO=?', [CNO], function(err, rows) {
    client.query('set @CNT=0', [CNO], function(err, rows) {
      client.query('update r_comment set r_comment.CNO = @CNT:=@CNT+1', [CNO], function(err, rows) {
        if(err){
          console.error(err);
        }
        else{
          res.redirect('/applys/show/'+ RNO);
        }
    });
  });
});
});

module.exports = router;

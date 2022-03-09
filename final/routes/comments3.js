var express  = require('express');
var router = express.Router();
const mysql = require("mysql");   // mysql 모듈 require
var msg = require ('dialog');

let client = mysql.createConnection({
  user: "root",
  password: "password",
  database: "DA"
})


// update
router.post('/edit/:QNO/:CNO', function(req, res){
  var CNO = req.params.CNO;
  var QNO = req.params.QNO;
  var sql = "update q_comment set content=?, day=now() WHERE CNO=?";
  var a = "";
  if(req.body.text == a){
    msg.info ("댓글을 입력해주세요.");
  }else{
  client.query(sql, [req.body.text, CNO], function(err, result, fields){
      if(err){
        console.error(err);
      }
      else{
        res.redirect('/posts2/show/'+ QNO);
      }
  });
}
});

// destroy
router.get('/delete/:CNO/:QNO', function(req, res){
  var CNO = req.params.CNO;
  var QNO = req.params.QNO;

  client.query('delete from q_comment where CNO=?', [CNO], function(err, rows) {
    client.query('set @CNT=0', [CNO], function(err, rows) {
      client.query('update q_comment set q_comment.CNO = @CNT:=@CNT+1', [CNO], function(err, rows) {
        if(err){
          console.error(err);
        }
        else{
          res.redirect('/posts2/show/'+ QNO);
        }
    });
  });
});
});

module.exports = router;

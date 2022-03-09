var express  = require('express');
var router = express.Router();
const mysql = require("mysql");   // mysql 모듈 require

// 커넥션 연결
let client = mysql.createConnection({
  user: "root",
  password: "password",
  database: "DA"
})

//index
router.get('/index', function(req, res, next) {
  var day = req.body.day;
  var today_sql = "SELECT * FROM Counter where day=CURDATE()";
  var yesterday_sql = "SELECT * FROM Counter where day=subdate(curdate(),1)"
  var twodaysago_sql = "SELECT * FROM Counter where day=subdate(curdate(),2)";
  var threedaysago_sql = "SELECT * FROM Counter where day=subdate(curdate(),3)";
  var fourdaysago_sql = "SELECT * FROM Counter where day=subdate(curdate(),4)";
  client.query(today_sql, function(err, result1, fields){
    client.query(yesterday_sql, function(err, result2, fields){
      client.query(twodaysago_sql, function(err, result3, fields){
        client.query(threedaysago_sql, function(err, result4, fields){
          client.query(fourdaysago_sql, function(err, result5, fields){
            if(err){
              console.log("쿼리문에 오류가 있습니다.");
            }
            else{
              res.render('posts4/index', {
                result1: result1, result2: result2, result3: result3,result4: result4,result5: result5
              });
            }
          });
        });
      });
    });
  });
});



module.exports = router;

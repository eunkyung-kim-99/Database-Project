var express  = require('express');
var router = express.Router();
const mysql = require("mysql");   // mysql 모듈 require
var msg = require ('dialog');

// 커넥션 연결
let client = mysql.createConnection({
  user: "root",
  password: "password",
  database: "DA"
})

router.get('/index', function(req, res, next) {
  const pageNum = Number(req.query.pageNum) || 1;
  const contentSize = 10;
  const pnSize = 10;
  const skipSize = (pageNum - 1) * contentSize;

  client.query('SELECT count(*) as `count` FROM Registration_board', (countQueryErr, countQueryResult) => {
    if (countQueryErr) throw countQueryErr;
    const totalCount = Number(countQueryResult[0].count);
    const pnTotal = Math.ceil(totalCount / contentSize);
    const pnStart = ((Math.ceil(pageNum / pnSize) - 1) * pnSize) + 1;
    let pnEnd = (pnStart + pnSize) - 1;
    client.query('SELECT * FROM Registration_board ORDER BY RNO DESC LIMIT ?, ?', [skipSize, contentSize], (contentQueryErr, contentQueryResult) => {
      if (contentQueryErr) throw contentQueryErr;
      if (pnEnd > pnTotal) pnEnd = pnTotal;
      const result = {
        pageNum,
        pnStart,
        pnEnd,
        pnTotal,
        contents: contentQueryResult,
      };
      res.render('applys/index', {
        results: result,
      });
    });
  });
});

//index
router.get('/index', function(req, res, next) {
  client.query("SELECT * FROM Registration_board;", function(err, result, fields){
    if(err){
      console.log("쿼리문에 오류가 있습니다.");
    }
    else{
      client.query("SELECT * FROM Registration_board ORDER BY RNO DESC;", function(err, result, fields){
      res.render('applys/index', {
        data: results
      });
    });
  }
  });
});

//new
router.get('/new', function(req, res, next) {
    client.query("SELECT * FROM Registration_board;", function(err, result, fields){
      if(err){
        console.log("쿼리문에 오류가 있습니다.");
      }
      else{
        res.render('applys/new', {
          results: result
        });
      }
    });
  });


router.post('/new', function(req, res, next) {
  var body = req.body;
  var cnt_sql = "insert into Counter (day, RNO_cnt) values (curdate(), RNO_cnt+1) ON DUPLICATE KEY UPDATE day=curdate(), RNO_cnt=RNO_cnt+1;";
  // 없으면 현재시간 insert, 있으면 현재시간에 update
  var a ="";
  if(body.title == a || body.content == a || body.place == a || body.date == a || body.time == a){
    msg.info ("모든 정보를 입력해주세요.");
  } else{
  client.query("INSERT INTO Registration_board (title, content, place, date, author, time) VALUES (?, ?, ?, ?,?, ?)", [
    body.title, body.content, body.place, body.date, req.session.passport.user.id,body.time,
  ], function(){
    client.query("set @CNT=0", [
      body.title, body.content, body.place, body.date, body.time,
    ], function(){
      client.query(cnt_sql, [
        body.title, body.content, body.place, body.date, body.time,
      ], function(){
        client.query("update Registration_board set Registration_board.RNO = @CNT:=@CNT+1", [
          body.title, body.content, body.place, body.date, body.time,
        ], function(){
          res.redirect("/applys/index");
        });
      });
    });
  });
}
});

//show
router.get('/show/:RNO', function(req, res, next) {
  var RNO = req.params.RNO;
  var sql = "SELECT * FROM Registration_board WHERE RNO=?";
  if(req.isAuthenticated()){
  client.query(sql, [RNO], function(err, results){
    if(err){
      console.log("err");
    }
    else{
      client.query('SELECT * FROM r_comment WHERE RNO = ?;', [RNO], function(err, result, fields) {
        console.log("RNO:"+RNO);
        if(result.length){
          res.render('applys/show', {
            result: result,
            data: results[0],
        });
      } else{
        res.render('applys/show', {
        data: results[0],
        result: {},
      });
      }
      });
    }
  });
} else{
  res.redirect("/login");
}
});

//edit
router.get('/edit/:RNO', function(req, res, next) {
var RNO = req.params.RNO;
var sql = "SELECT * FROM Registration_board WHERE RNO=?";
client.query(sql, [RNO], function(err, result){
  if(err){
    console.log("err");
  }
  else{
    res.render('applys/edit', { data: result[0]});
  }
});
});

router.post('/edit/:RNO',function(req,res,next){
  var RNO = req.params.RNO;
  var title = req.body.title;
  var content = req.body.content;
  var place = req.body.place;
  var date = req.body.date;
  var time = req.body.time;
  var datas = [title, content, date, time, place, RNO];

  var sql = "update Registration_board set title=?, content=?, date=?, time=?, place=?, day=now() where RNO=?";
  client.query(sql, datas, function(err, result, fields){
      if(err){
        console.error(err);
      }
      else{
          res.redirect('/applys/show/'+ RNO);
      }
  });
});

//DELETE
router.get('/delete/:RNO', function(req, res, next) {
var RNO = req.params.RNO;
var cnt_sql = "update Counter set Counter.RNO_cnt = Counter.RNO_cnt - 1";
client.query('delete from r_comment where RNO=?', [RNO], function(err, rows) {
client.query('delete from Registration_board where RNO=?', [RNO], function(err, rows) {
  client.query('set @CNT=0', [RNO], function(err, rows) {
    client.query('update Registration_board set Registration_board.RNO = @CNT:=@CNT+1', [RNO], function(err, rows) {
      client.query(cnt_sql, [RNO], function(err, rows) {
        if(err){
          console.error(err);
        }
        else{
          res.redirect('/applys/index');
        }
    });
  });
  });
});
});
});


var isAuthenticated = function(req, res, next) {
  if(req.isAuthenticated())
    return next();
  res.redirect('/login');
};


// comment create
router.post('/show/:RNO', function(req, res, next) {
  var body = req.body;
  var sql = "SELECT RNO FROM Registration_board WHERE RNO=?";
  var RNOs=req.params.RNO;
  var a = "";
  if(body.content == a){
    msg.info ("댓글을 입력해주세요.");
  }else{
  client.query(sql,[RNOs],function(){
    client.query("INSERT INTO R_comment (RNO, id, content) VALUES (?, ?, ?)", [
      RNOs, req.session.passport.user.id, body.content,
    ], function(){
      client.query("set @CNT=0", [
        body.content,
      ], function(){
        client.query("update R_comment set R_comment.CNO = @CNT:=@CNT+1", [
          body.content,
        ], function(){
      res.redirect("/applys/show/"+ RNOs);
        });
      });
    });
  });
}
});
module.exports = router;

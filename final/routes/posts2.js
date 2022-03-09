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

  client.query('SELECT count(*) as `count` FROM question_board', (countQueryErr, countQueryResult) => {
    if (countQueryErr) throw countQueryErr;
    const totalCount = Number(countQueryResult[0].count);
    const pnTotal = Math.ceil(totalCount / contentSize);
    const pnStart = ((Math.ceil(pageNum / pnSize) - 1) * pnSize) + 1;
    let pnEnd = (pnStart + pnSize) - 1;
    client.query('SELECT * FROM question_board ORDER BY QNO DESC LIMIT ?, ?', [skipSize, contentSize], (contentQueryErr, contentQueryResult) => {
      if (contentQueryErr) throw contentQueryErr;
      if (pnEnd > pnTotal) pnEnd = pnTotal;
      const result = {
        pageNum,
        pnStart,
        pnEnd,
        pnTotal,
        contents: contentQueryResult,
      };
      res.render('posts2/index', {
        results: result,
      });
    });
  });
});

router.get('/index', function(req, res, next) {
  const { QNO } = req.params;
  client.query('SELECT * FROM question_board WHERE QNO = ?', [QNO], (err, results) => {
    if (err) throw err;
    res.render('posts2/index', {
      data: results,
    });
  });
});

//new
router.get('/new', function(req, res, next) {
    client.query("SELECT * FROM Question_board;", function(err, result, fields){
      if(err){
        console.log("쿼리문에 오류가 있습니다.");
      }
      else{
        res.render('posts2/new', {
          results: result
        });
      }
    });
});

router.post('/new', function(req, res, next) {
  var body = req.body;
  var a ="";
  if(body.title == a || body.content == a){
    msg.info ("모든 정보를 입력해주세요.");
  } else{
  client.query("INSERT INTO Question_board (title, content, author) VALUES (?, ?, ?)", [
    body.title, body.content, req.session.passport.user.id
  ], function(){
    client.query("set @CNT=0", [
      body.title, body.content
    ], function(){
      client.query("update Question_board set Question_board.QNO = @CNT:=@CNT+1", [
        body.title, body.content
      ], function(){
    res.redirect("/posts2/index");
      });
    });
  });
}
});

//show
router.get('/show/:QNO', function(req, res, next) {
  var QNO = req.params.QNO;
  var sql = "SELECT * FROM Question_board WHERE QNO=?";
  if(req.isAuthenticated()){
  client.query(sql, [QNO], function(err, results){
    if(err){
      console.log("err");
    }
    else{
      client.query('SELECT * FROM q_comment WHERE QNO = ?;', [QNO], function(err, result, fields) {
        console.log("QNO:"+QNO);
        if(result.length){
          res.render('posts2/show', {
            result: result,
            data: results[0],
        });
      } else{
        res.render('posts2/show', {
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
router.get('/edit/:QNO', function(req, res, next) {
  var QNO = req.params.QNO;
  var sql = "SELECT * FROM Question_board WHERE QNO=?";
  client.query(sql, [QNO], function(err, result){
    if(err){
      console.log("err");
    }
    else{
      res.render('posts2/edit', { data: result[0]});
    }
  });
});

  router.post('/edit/:QNO',function(req,res,next){
    var QNO = req.params.QNO;
    var title = req.body.title;
    var content = req.body.content;
    var datas = [title, content, QNO];

    var sql = "update Question_board set title=?, content=?, day=now() where QNO=?";
    client.query(sql, datas, function(err, result, fields){
        if(err){
          console.error(err);
        }
        else{
            res.redirect('/posts2/show/'+ QNO);
        }
    });
  });

  //DELETE
  router.get('/delete/:QNO', function(req, res, next) {
  var QNO = req.params.QNO;
  client.query('delete from q_comment where QNO=?', [QNO], function(err, rows) {
  client.query('delete from Question_board where QNO=?', [QNO], function(err, rows) {
    client.query('set @CNT=0', [QNO], function(err, rows) {
      client.query('update Question_board set Question_board.QNO = @CNT:=@CNT+1', [QNO], function(err, rows) {
        if(err){
          console.error(err);
        }
        else{
          res.redirect('/posts2/index');
        }
      });
    });
  });
});
});

// comment create
router.post('/show/:QNO', function(req, res, next) {
  var body = req.body;
  var sql = "SELECT QNO FROM question_board WHERE QNO=?";
  var QNOs=req.params.QNO;
  var a = "";
  if(body.content == a){
    msg.info ("댓글을 입력해주세요.");
  }else{
  client.query(sql,[QNOs],function(){
    client.query("INSERT INTO Q_comment (QNO, id, content) VALUES (?, ?, ?)", [
      QNOs, req.session.passport.user.id, body.content,
    ], function(){
      client.query("set @CNT=0", [
        body.content,
      ], function(){
        client.query("update Q_comment set Q_comment.CNO = @CNT:=@CNT+1", [
          body.content,
        ], function(){
      res.redirect("/posts2/show/"+ QNOs);
        });
      });
    });
  });
}
});
module.exports = router;

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

  client.query('SELECT count(*) as `count` FROM community_board', (countQueryErr, countQueryResult) => {
    if (countQueryErr) throw countQueryErr;
    const totalCount = Number(countQueryResult[0].count);
    const pnTotal = Math.ceil(totalCount / contentSize);
    const pnStart = ((Math.ceil(pageNum / pnSize) - 1) * pnSize) + 1;
    let pnEnd = (pnStart + pnSize) - 1;
    client.query('SELECT * FROM community_board ORDER BY MNO DESC LIMIT ?, ?', [skipSize, contentSize], (contentQueryErr, contentQueryResult) => {
      if (contentQueryErr) throw contentQueryErr;
      if (pnEnd > pnTotal) pnEnd = pnTotal;
      const result = {
        pageNum,
        pnStart,
        pnEnd,
        pnTotal,
        contents: contentQueryResult,
      };
      res.render('posts/index', {
        results: result,
      });
    });
  });
});

router.get('/index', function(req, res, next) {
  const { MNO } = req.params;
  client.query('SELECT * FROM community_board WHERE MNO = ?', [MNO], (err, results) => {
    if (err) throw err;
    res.render('posts/index', {
      data: results,
    });
  });
});


//new
router.get('/new', function(req, res, next) {
    client.query("SELECT * FROM Community_board;", function(err, result, fields){
      if(err){
        console.log("쿼리문에 오류가 있습니다.");
      }
      else{
        res.render('posts/new', {
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
  client.query("INSERT INTO Community_board (title, content, author) VALUES (?, ?, ?)", [
    body.title, body.content, req.session.passport.user.id
  ], function(){
    client.query("set @CNT=0", [
      body.title, body.content
    ], function(){
      client.query("update Community_board set Community_board.MNO = @CNT:=@CNT+1", [
        body.title, body.content
      ], function(){
    res.redirect("/posts/index");
      });
    });
  });
}
});


//show
router.get('/show/:MNO', function(req, res, next) {
  var MNO = req.params.MNO;
  var sql = "SELECT * FROM Community_board WHERE MNO=?";
  if(req.isAuthenticated()){
  client.query(sql, [MNO], function(err, results){
    if(err){
      console.log("err");
    }
    else{
      client.query('SELECT * FROM c_comment WHERE MNO = ?;', [MNO], function(err, result, fields) {
        console.log("MNO:"+MNO);
        if(result.length){
          res.render('posts/show', {
            result: result,
            data: results[0],
        });
      } else{
        res.render('posts/show', {
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
router.get('/edit/:MNO', function(req, res, next) {
  var MNO = req.params.MNO;
  var sql = "SELECT * FROM Community_board WHERE MNO=?";
  client.query(sql, [MNO], function(err, result){
    if(err){
      console.log("err1");
    }
    else{
      res.render('posts/edit', { data: result[0]});
    }
  });
});

router.post('/edit/:MNO',function(req,res,next){
    var MNO = req.params.MNO;
    var title = req.body.title;
    var content = req.body.content;
    var datas = [title, content, MNO];

    var sql = "update Community_board set title=?, content=?, day=now() where MNO=?";
    client.query(sql, datas, function(err, result, fields){
        if(err){
          console.error(err);
        }
        else{
            res.redirect('/posts/show/'+ MNO);
        }
    });
  });

  //DELETE
  router.get('/delete/:MNO', function(req, res, next) {
  var MNO = req.params.MNO;
  client.query('delete from c_comment where MNO=?', [MNO], function(err, rows) {
  client.query('delete from Community_board where MNO=?', [MNO], function(err, rows) {
    client.query('set @CNT=0', [MNO], function(err, rows) {
      client.query('update Community_board set Community_board.MNO = @CNT:=@CNT+1', [MNO], function(err, rows) {
        if(err){
          console.error(err);
        }
        else{
          res.redirect('/posts/index');
        }
      });
    });
  });
});
});


// comment create
router.post('/show/:MNO', function(req, res, next) {
  var body = req.body;
  var sql = "SELECT MNO FROM question_board WHERE MNO=?";
  var MNOs=req.params.MNO;
  var a = "";
  if(body.content == a){
    msg.info ("댓글을 입력해주세요.");
  }else{
  client.query(sql,[MNOs],function(){
    client.query("INSERT INTO C_comment (MNO, id, content) VALUES (?, ?, ?)", [
      MNOs, req.session.passport.user.id, body.content,
    ], function(){
      client.query("set @CNT=0", [
        body.content,
      ], function(){
        client.query("update C_comment set C_comment.CNO = @CNT:=@CNT+1", [
          body.content,
        ], function(){
      res.redirect("/posts/show/"+ MNOs);
        });
      });
    });
  });
}
});
module.exports = router;

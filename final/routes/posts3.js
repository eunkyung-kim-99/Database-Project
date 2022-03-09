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

//index
router.get('/index', function(req, res, next) {
  const pageNum = Number(req.query.pageNum) || 1; // NOTE: 쿼리스트링으로 받을 페이지 번호 값, 기본값은 1
  const contentSize = 10; // NOTE: 페이지에서 보여줄 컨텐츠 수.
  const pnSize = 10; // NOTE: 페이지네이션 개수 설정.
  const skipSize = (pageNum - 1) * contentSize; // NOTE: 다음 페이지 갈 때 건너뛸 리스트 개수.

  client.query('SELECT count(*) as `count` FROM Data_board', (countQueryErr, countQueryResult) => {
    if (countQueryErr) throw countQueryErr;
    const totalCount = Number(countQueryResult[0].count); // NOTE: 전체 글 개수.
    const pnTotal = Math.ceil(totalCount / contentSize); // NOTE: 페이지네이션의 전체 카운트
    const pnStart = ((Math.ceil(pageNum / pnSize) - 1) * pnSize) + 1; // NOTE: 현재 페이지의 페이지네이션 시작 번호.
    let pnEnd = (pnStart + pnSize) - 1; // NOTE: 현재 페이지의 페이지네이션 끝 번호.
    client.query('SELECT * FROM Data_board ORDER BY DNO DESC LIMIT ?, ?', [skipSize, contentSize], (contentQueryErr, contentQueryResult) => {
      if (contentQueryErr) throw contentQueryErr;
      if (pnEnd > pnTotal) pnEnd = pnTotal; // NOTE: 페이지네이션의 끝 번호가 페이지네이션 전체 카운트보다 높을 경우.
      const result = {
        pageNum,
        pnStart,
        pnEnd,
        pnTotal,
        contents: contentQueryResult,
      };
      res.render('posts3/index', {
        results: result,
      });
    });
  });
});


router.get('/index', function(req, res, next) {
  client.query("SELECT * FROM Data_board;", function(err, result, fields){
    if(err){
      console.log("쿼리문에 오류가 있습니다.");
    }
    else{
      res.render('posts3/index', {
        results: result
      });
    }
  });
});

//new
router.get('/new', function(req, res, next) {
    client.query("SELECT * FROM Data_board;", function(err, result, fields){
      if(err){
        console.log("쿼리문에 오류가 있습니다.");
      }
      else{
        res.render('posts3/new', {
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
  client.query("INSERT INTO Data_board (title, content, author) VALUES (?, ?, ?)", [
    body.title, body.content, req.session.passport.user.id
  ], function(){
    client.query("set @CNT=0", [
      body.title, body.content
    ], function(){
      client.query("update Data_board set Data_board.DNO = @CNT:=@CNT+1", [
        body.title, body.content
      ], function(){
    res.redirect("/posts3/index");
      });
    });
  });
}
});


//show
router.get('/show/:DNO', function(req, res, next) {
    var DNO = req.params.DNO;
    var sql = "SELECT * FROM Data_board WHERE DNO=?";
    if(req.isAuthenticated()){
    client.query(sql, [DNO], function(err, result){
      if(err){
        console.log("err");
      }
      else{
        res.render('posts3/show', { data: result[0]});
      }
    });
  } else {
    res.redirect("/login");
  }
});

//edit
router.get('/edit/:DNO', function(req, res, next) {
  var DNO = req.params.DNO;
  var sql = "SELECT * FROM Data_board WHERE DNO=?";
  client.query(sql, [DNO], function(err, result){
    if(err){
      console.log("err");
    }
    else{
      res.render('posts3/edit', { data: result[0]});
    }
  });
});

  router.post('/edit/:DNO',function(req,res,next){
    var DNO = req.params.DNO;
    var title = req.body.title;
    var content = req.body.content;
    var datas = [title, content, DNO];

    var sql = "update Data_board set title=?, content=?, day=now() where DNO=?";
    client.query(sql, datas, function(err, result, fields){
        if(err){
          console.error(err);
        }
        else{
            res.redirect('/posts3/show/'+ DNO);
        }
    });
  });

  //DELETE
  router.get('/delete/:DNO', function(req, res, next) {
  var DNO = req.params.DNO;
  client.query('delete from Data_board where DNO=?', [DNO], function(err, rows) {
    console.log("1");
    client.query('set @CNT=0', [DNO], function(err, rows) {
      client.query('update Data_board set Data_board.DNO = @CNT:=@CNT+1', [DNO], function(err, rows) {
        if(err){
          console.error(err);
        }
        else{
          res.redirect('/posts3/index');
        }
      });
    });
  });
});


module.exports = router;

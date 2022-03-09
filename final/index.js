var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('./config/passport');
var util = require('./util');
var app = express();

app.use(session({
  secret: 'key',
  resave: false,
  saveUninitialized: true
}));

// Other settings
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(session({secret:'MySecret', resave:true, saveUninitialized:true}));

// Passport
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Custom Middlewares
app.use(function(req,res,next){
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
});

// Routes
app.use('/', require('./routes/home'));
app.use('/posts', util.getPostQueryString, require('./routes/posts'));
app.use('/posts2', util.getPost2QueryString, require('./routes/posts2'));
app.use('/posts3', util.getPost3QueryString, require('./routes/posts3'));
app.use('/posts4', util.getPost3QueryString, require('./routes/posts4'));
app.use('/applys', util.getApplyQueryString, require('./routes/applys'));
app.use('/users', require('./routes/users'));
app.use('/comments', util.getPostQueryString, require('./routes/comments'));
app.use('/comments2', util.getApplyQueryString, require('./routes/comments2'));
app.use('/comments3', util.getPost2QueryString, require('./routes/comments3'));

// Port setting
var port = 3000;
app.listen(port, function(){
  console.log('server on! http://localhost:'+port);
});

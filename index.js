var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var fs = require('fs');
var data = require("./data.json");
const mongoose = require('mongoose');
// var userController = require('./controllers/user');
var controllers = require('./controllers');
var User = require('./models/User');
var Post = require('./models/Post');
var Tag = require('./models/Tag');

// mongoose.connect('mongodb://borges:aleph@ds019976.mlab.com:19976/borges');
mongoose.connect('mongodb://localhost/borges');
var conn = mongoose.connection;

app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

function db (req, res, next) {
  req.db = {
    User: conn.model('User', User, 'users'),
    Post: conn.model('Post', Post, 'posts'),
    Tag: conn.model('Tag', Tag, 'tags')
  };
  return next();
}

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb'}));
// app.use(bodyParser({limit: '50mb'}));
// app.use(express.bodyParser({limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));

var port = process.env.PORT || 3000;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json(data);   
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api

app.post('/api/user', (req, res) => {
  var name = req.body.name;
  var access_token = req.body.access_token;
  var id = req.body.id;

  var query = {id: id};

  User.findOne(query, function (err, user) {
    if (user) {
      res.json({"status":"exist", "user":user});
    } else {
      var userData = { 
        name: name,
        access_token: access_token,
        id: id
      };

      var newUser = new User(userData).save(function (err){
        // req.session.user = userData;
        // console.log('New user '+name+' has been created!');
        // res.redirect('/profile');
        res.json({"status":"created", "user":userData});
      });
    }
  });
});

app.get('/api/users/:access_token', (req, res) => {
  var query = {access_token: req.params.access_token};
  User.findOne(query, function (err, user) {
    if (user)
      res.json({"status":"exist", "user":user});
    else
      res.json({"status":"noexist", "user":null});
  });
});

// app.get('/api/getPosts', (req, res) => {
//   var query = JSON.parse(req.query.filter) || {};
//   Post.find(query, (err, items) => {
//     res.send(items); 
//   })
// });

// User
app.get('/api/createInitialUsers', db, controllers.users.createInitialUsers);
app.post('/api/loginWithToken', db, controllers.users.loginWithToken);
app.post('/api/login', db, controllers.users.login);

// Post
app.get('/api/posts', db, controllers.posts.getPosts);
app.post('/api/posts', db, controllers.posts.add);
app.get('/api/posts/:id', db, controllers.posts.getPost);
app.put('/api/posts/:id', db, controllers.posts.updatePost);
app.delete('/api/posts/:id', db, controllers.posts.deletePost);

// Tags
app.get('/api/tags', db, controllers.tags.getTags);
app.get('/api/getFilteredTags', db, controllers.tags.getFilteredTags);
app.get('/api/tag/name/:name', db, controllers.tags.getTagByName);
app.get('/api/tag/:id', db, controllers.tags.getTagById);
app.post('/api/tags', db, controllers.tags.add);
app.put('/api/tags/:id', db, controllers.tags.updateTag);
app.delete('/api/tags/:id', db, controllers.tags.deleteTag);

// START THE SERVER
// =============================================================================
conn.on('error', console.error.bind(console, 'connection error:'));  
conn.once('open', function() {
	// Wait for the database connection to establish, then start the app.                         
	console.log("MongoDB connected 👌");

	app.listen(port);
	console.log('Running Borges API server on port ' + port);
});

var randomString = function(length) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}
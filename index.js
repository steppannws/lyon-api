var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var fs = require('fs');
var data = require("./data.json");
const mongoose = require('mongoose');

mongoose.connect('mongodb://borges:aleph@ds019976.mlab.com:19976/borges');
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

//Models
// create user model 
var User = mongoose.model('User', {
  username: String,
  email: String,
  password: String,
  dateCreated: String,
  lastDateEntered: String,
  posts: 0,
  accessToken: String,
  role: String //superuser, editor, moderator, user
});

var Item = mongoose.model('Item', {
  owner: String,
  type: String,
  dateCreated: String,
  lastTimeModified: String,
  state: 0, //0 - created; 1 - public; 2 - deleted
  shares:0,
  views: 0,
  modifiedBy: [],
  tags: [],
  favUsers: [],
  references: [],

  title: String,
  subtitle: String,
  text: String,
  social: {
    twitter: "",
    facebook: "",
    googleplus: "",
  },
  media: {
    thumbnail: String,
    video: String, 
    audio: String,
    images: [],
  },
  referenceLink: String,
  date: String,
});

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

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
app.use('/data', router);

app.get('/api/getItems', (req, res) => {
  Item.find(JSON.parse(req.query.filter), (err, items) => {
    res.send(items); 
  })
});

// START THE SERVER
// =============================================================================
conn.on('error', console.error.bind(console, 'connection error:'));  
conn.once('open', function() {
	// Wait for the database connection to establish, then start the app.                         
	console.log("MongoDB connected 👌");

	app.listen(port);
	console.log('Running Borges API server on port ' + port);
});
objectId = require('mongodb').ObjectID;

var LIMIT = 10;
var SKIP = 0;

exports.add = function(req, res, next) {
  if (req.body) {
    req.db.Post.create({
      content: {
        title: req.body.title,
        subtitle: req.body.subtitle,
        text: req.body.text
      },
      author: req.body.user._id,
    }, function(err, docs) {
      if (err) {
        console.error(err);
        next(err);
      } else {
        res.status(200).json(docs);
      }
    });
  } else {
    next(new Error('No data'));
  }
};

exports.getPosts = function(req, res, next) {
  var query = JSON.parse(req.query.filter) || {};
  req.db.Post.find(query, (err, items) => {
    res.send(items); 
  })
};


exports.getPost = function(req, res, next) {

};

exports.del = function(req, res, next) {
  
};

exports.updatePost = function(req, res, next) {
 
};
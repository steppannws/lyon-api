objectId = require('mongodb').ObjectID;
_ = require('lodash');

exports.add = function(req, res, next) {
  if (req.body) {

    var newPost = new req.db.Post();

    // Save Tags logic
    var tagsToStore = [];

    _.map(req.body.tags, (tag) => {
      if(tag.className != undefined) {
        var newTag = new req.db.Tag({name: tag.label.toLowerCase(), posts:newPost._id});
        tagsToStore.push(newTag._id);
        newTag.save();
      } else {
        tagsToStore.push(tag.value);
        // Update existing Tags
        // WARN! without the callback method this won't update!
        req.db.Tag.findByIdAndUpdate(tag.value, { $push: {posts:newPost._id}, $set: {updated_at: Date.now()}}, (err, tag) => {});
      }
    });

    newPost.content = {
      title: req.body.title,
      subtitle: req.body.subtitle,
      text: req.body.text
    };
    newPost.author = req.body.user._id;
    newPost.tags = tagsToStore;

    newPost.save((err, post) => {
      if (err) {
        console.error(err);
        next(err);
      } else {
        res.status(200).json(post);
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
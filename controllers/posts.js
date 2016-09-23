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
      text: req.body.text,
      reference_link: req.body.reference_link
    };
    newPost.media = req.body.media;
    newPost.author = req.body.user._id;
    newPost.tags = tagsToStore;
    newPost.date = req.body.date;
    newPost.state = req.body.state;

    // return;
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
  var filds = 'content state created_at views_counter favorites_counter modified_by type author';
  req.db.Post.find(query, filds,(err, items) => {
    res.send(items); 
  })
};

exports.getPost = function(req, res, next) {
  req.db.Post.findById(req.params.id)
  .populate('author tags')
  .exec(function (err, post) {
    if (err) {
      console.error(err);
      next(err);
    } else {
      var userObject = post.author.toObject();
      delete userObject.password;
      delete userObject.posts;
      post.author = userObject;

      res.status(200).json(post);
    }
  });
};

exports.updatePost = function(req, res, next) {
  req.db.Post.findById(req.params.id, function(err, post) {
    if (err) next(err);

    // doc.title = req.body.title;
    // doc.text = req.body.text || null;
    // doc.url = req.body.url || null;

    // Save Tags logic
    var tagsToStore = [];

    _.map(req.body.tags, (tag) => {
      if(tag.className != undefined) {
        var newTag = new req.db.Tag({name: tag.label.toLowerCase(), posts:post._id});
        tagsToStore.push(newTag._id);
        newTag.save();
      } else {
        tagsToStore.push(tag.value);
        // Update existing Tags
        // WARN! without the callback method this won't update!
        req.db.Tag.findByIdAndUpdate(tag.value, { $push: {posts:post._id}, $set: {updated_at: Date.now()}}, (err, tag) => {});
      }
    });

    post.content = {
      title: req.body.title,
      subtitle: req.body.subtitle,
      text: req.body.text,
      reference_link: req.body.reference_link
    };
    post.media = req.body.media;
    post.modified_by.push(req.body.user._id);
    post.tags = tagsToStore;
    post.date = req.body.date;
    post.state = req.body.state;
    post.updated_at = Date.now();

    post.save(function(e, d) {
      if (e) return next(e);
      res.status(200).json(d);
    });
  })
};

exports.deletePost = function(req, res, next) {
  req.db.Post.findById(req.params.id, function(err, post) {
    if (err) return next(err);
    // if (req.session.admin || req.session.userId === obj.author.id) {
      post.remove();
      res.status(200).json(post);
    // } else {
      // next(new Error('User is not authorized to delete post.'));
    // }
  })
};
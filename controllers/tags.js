exports.getTags = function(req, res, next) {
  req.db.Tag.find({}, (err, tags) => {
    res.send(tags); 
  });
  /*
  var query = JSON.parse(req.query.filter) || {};
  var fields = 'name posts created_at';

  req.db.Tag.find(query, fields)//, {skip: 0, limit: 100})
  .sort('-created_at')
  .exec((err, tags) => {
    res.send(tags); 
  });*/
};

exports.getFilteredTags = function(req, res, next) {
  var query = JSON.parse(req.query.filter) || {};
  var fields = 'name posts created_at';

  req.db.Tag.find(query, fields)//, {skip: 0, limit: 100})
  .sort('-created_at')
  .exec((err, tags) => {
    res.send(tags); 
  });
};

exports.add = function(req, res, next) {
  if (req.body && req.body.name != "") {

    var newTag = {
      name: req.body.name
    };

    req.db.Tag.findOne(newTag, function(err, tag){
      if (err) return next(err);
      if(tag == null) {
        var tag = new req.db.Tag(newTag);
        tag.save(function(err) {
          if (err) next(err);
          res.json({exist: false, data: tag});
        });
      } else 
        res.json({exist: true, data: tag});
    })

  	// req.db.Tag.findOne({name: req.body.name}, (err, tag) => {
  	// 	res.json(tag);
  	// });
  	/*
    var tag = new req.db.Tag({name: req.body.name});
    tag.save((err) => {
    	console.log('TAG ERROR', err, tag);
    	if(err) {
    		res.json(tag);
    	} else {
    		// next(err);
	    	var tagObject = tag.toObject();
			delete tagObject.created_at;
			delete tagObject.updated_at;
			delete tagObject.posts;
	    	res.json(tagObject);
    	}
    });
    */
  } else {
    next(new Error('No data'));
  }
};

exports.updateTag = function(req, res, next) {
  req.db.Tag.findOne({name: req.body.name}, function(err, tagName){
    if (err) return next(err);
    if(tagName == null) {

      req.db.Tag.findById(req.params.id, function(err, tagId) {
        if (err) next(err);

        tagId.name = req.body.name;
        tagId.updated_at = Date.now();

        tagId.save(function(e, d) {
          if (e) return next(e);
          res.status(200).json(d);
        });
      })

    } else 
      res.json({exist: true, data: tagName});
  })
};

exports.getTagByName = function(req, res, next) {
  req.db.Tag.findOne({name: req.params.name}, function(err, tag) {
    if (err) next(err);
    if(tag != null) {
      res.json({exist: true, data: tag});
    } else 
      res.json({exist: false});
  })
};

exports.getTagById = function(req, res, next) {
  req.db.Tag.findById(req.params.id, function(err, tag) {
    if (err) next(err);
    if(tag != null) {
      res.json({exist: true, data: tag});
    } else 
      res.json({exist: false});
  })
};

exports.deleteTag = function(req, res, next) {
  return;
  // req.db.Post.find({"$match" : {"tags._id":req.params.id}}, (err, post) => {
  req.db.Post.find({_id: {$in: req.params.id}}, (err, post) => {
    console.log(post);
    res.json({state: 'success'});
  });

  return;
  req.db.Tag.findById(req.params.id, function(err, tag) {
    return tag.remove((err) => {
      if(!err) {
        req.db.Post.update({_id: {$in: tag._id}});

        res.json({state: 'success'});
        console.log('REMOVED');
      }
    })
    // if (err) return next(err);
    // // TODO: remove tag from each Post
    // post.remove();
    // res.status(200).json(post);
  })
};


exports.testTag = function(req, res, next) {
	var testTag = {
		name: 'Buenos Aires'
	};

	req.db.Tag.findOne(testTag, function(err, tag){
		if (err) return next(err);
		if(tag == null) {
			var tag = new req.db.Tag(testTag);
			tag.save(function(err) {
				if (err) next(err);
				res.json(tag);
			});
		} else 
			res.json(tag);
	})
};

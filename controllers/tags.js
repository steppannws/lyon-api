exports.getTags = function(req, res, next) {
  req.db.Tag.find({}, (err, tags) => {
    res.send(tags); 
  })
};

exports.add = function(req, res, next) {
  if (req.body) {
  	req.db.Tag.findOne({name: req.body.name}, (err, tag) => {
  		res.json(tag);
  	});
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

exports.editTag = function(req, res, next) {

};

exports.deleteTag = function(req, res, next) {
  req.db.Tag.findById(req.params.id, function(err, tag) {
    return tag.remove((err) => {
      if(!err) {
        req.db.Post.update({_id: {$in: tag._id}});
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

var safeFields = 'username email';

exports.login = function(req, res, next) {
	var query = {username: req.body.username};
	req.db.User.findOneAndUpdate(query, {$set:{'lastDateEntered': new Date()}},function (err, user) {
		if(user) {
			if(user.password == req.body.password) {
				var userObject = user.toObject();
				delete userObject.password;
				delete userObject.posts;
				res.json({"status":"loged", "user":userObject});
			}
			else
				res.json({"status":"badpassword", "user":{}});
		} else {
			res.json({"status":"noexist", "user":{}});
		}
	});
};

exports.loginWithToken = function(req, res, next) {
	req.db.User.findOne(req.body, function(err, user){
		if (err) return next(err);
		var userObject = user.toObject();
		delete userObject.password;
		delete userObject.posts;
		res.status(200).json(userObject);
	})
};

exports.createInitialUsers = function(req, res, next) {
	var superUser = {
		username: 'borges',
		password: 'borgesinfinito2016!',
		email: 'steppannws@gmail.com',
		role: 'superuser',
		access_token: randomString(32), 
		created_at: Date.now(),
		lastentered_at: Date.now()
	};
	var editor1 = {
		username: 'sebastian',
		password: 'borgesinfinito2016!',
		email: 'sebsaiz@gmail.com',
		role: 'editor',
		access_token: randomString(32), 
		created_at: Date.now(),
		lastentered_at: Date.now()
	};
	var editor2 = {
		username: 'julian',
		password: 'borgesinfinito2016!',
		email: 'ezquerrajulian@yahoo.com',
		role: 'editor',
		access_token: randomString(32), 
		created_at: Date.now(),
		lastentered_at: Date.now()
	};
	var user = new req.db.User(editor2);
	user.save(function(err) {
		if (err) next(err);
		res.json(user);
	});
};

exports.getUser = function(req, res, next) {
	var fields = safeFields;
	if (req.session.admin) {
		fields = fields + ' email';
	}
	req.db.User.findProfileById(req.params.id, fields, function(err, data){
		if (err) return next(err);
		res.status(200).json(data);
	})
};

var randomString = function(length) {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}
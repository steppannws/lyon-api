exports.checkUser = function(req, res, next) {
  if (req.session && req.session.auth && req.session.userId && (req.session.user.approved || req.session.admin)) {
    console.info('Access USER: ' + req.session.userId);
    return next();
  } else {
    next(new Error('User is not logged in.'));
  }
};

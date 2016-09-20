var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: String,
  role: {type: String, defalt: 'user'}, //superuser, editor, moderator, user
  posts:[{type: Schema.Types.ObjectId, ref:'Post'}],
  access_token: String, 
  created_at: {type: Date, defalt: Date.now },
  updated_at: Date,
  lastentered_at: Date
});

var User = mongoose.model('User', userSchema);

module.exports = User;
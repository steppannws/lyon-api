var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate')
var Schema = mongoose.Schema;

var tagSchema = new Schema({
  name: { type: String, required: true, unique: true },
  posts:[{type: Schema.Types.ObjectId, ref:'Post'}],
  created_at: {type: Date, default: Date.now },
  updated_at: {type: Date, default: Date.now }
});

tagSchema.plugin(findOrCreate);

var Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
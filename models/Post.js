var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
	author: {type: Schema.Types.ObjectId, ref:'User'},
	type: { type: String, default: 'text' },
	state: { type: String, default: 'draft', index: true }, //draft, published, archived
	modified_by: [{type: Schema.Types.ObjectId, ref:'User'}],
	tags: [{type: Schema.Types.ObjectId, ref:'Tag'}],
	references: [{type: Schema.Types.ObjectId, ref:'Post'}],
	created_at: { type: Date, default: Date.now },
	updatet_at: { type: Date, default: Date.now },
	shares_counter: { type: Number, default: 0 },
	views_counter: { type: Number, default: 0 },
	favorites_counter: { type: Number, default: 0 },

	content: {
		title: { type: String, required: true },
		subtitle: { type: String, default: '' },
		text: { type: String, required: true },
		social: {
			twitter: { type: String, default: '' },
			facebook: { type: String, default: '' },
			googleplus:  { type: String, default: '' }
		},
		media: {
			thumbnail: {url: String, filename: String},
			images: [{url: String, filename: String}],
			video: { type: String, default: '' },
			audio: { type: String, default: '' }
		},
		reference_link: {url: String, label: String},
		date: { type: String, default: '' }
	}
});

var Post = mongoose.model('Post', postSchema);

module.exports = Post;
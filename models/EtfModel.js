var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EtfSchema = new Schema({
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
	media: {
		images: [{type: String, default: ''}],
		video: { type: String, default: '' },
		audio: { url: String, image: String}
	},
	content: {
		title: { type: String, required: true },
		subtitle: { type: String, default: '' },
		text: { type: String, required: true },
		reference_link: {url: String, label: String},
		date: { type: String, default: '' }
	}
});

var EtfModel = mongoose.model('Etf', EtfSchema);

module.exports = EtfModel;
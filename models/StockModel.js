var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StockSchema = new Schema({
	state: { type: String, default: 'draft', index: true }, //draft, published, archived
	created_at: { type: Date, default: Date.now },
	updatet_at: { type: Date, default: Date.now },
	finance: {
		ask: {type: String, default: '0'},
		bid: { type: String, default: '0' },
		category: { type: String, default: '' },
		legalType: { type: String, default: '' },
		ytdReturn: { 
			raw: {type: Number, default: 0},
			fmt: {type: String, default: '0'},
		},
		totalAssets: { 
			raw: {type: Number, default: 0},
			fmt: {type: String, default: '0'},
			longFmt: {type: String, default: '0'},
		},
		yield: { 
			raw: {type: Number, default: 0},
			fmt: {type: String, default: '0'},
		},
		fundInceptionDate: { 
			raw: {type: Number, default: 0},
			fmt: {type: String, default: '0'},
		},
		threeYearAverageReturn: { 
			raw: {type: Number, default: 0},
			fmt: {type: String, default: '0'},
		},
		fiveYearAverageReturn: { 
			raw: {type: Number, default: 0},
			fmt: {type: String, default: '0'},
		},
	},
	profile: {
		name: {type: String, default: ''},
		symbol: {type: String, default: ''},
		summery: {type: String, default: ''}
	},
	// sectorsIndustries: [{type: Schema.Types.ObjectId, ref:'SectorIndustrieModel'}],
	sectorsIndustries: [{ 
		name: {type: String, default: '' },
		raw: {type: Number, default: 0 },
		fmt: {type: String, default: '' },
	}],
	topHoldings: [{type: Schema.Types.ObjectId, ref:'StockModel'}]

});

var StockModel = mongoose.model('Stock', StockSchema);

module.exports = StockModel;
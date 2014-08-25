var mongoose = require('../lib/mongoose');

var schema = mongoose.Schema({
	textarea: String,
	uri: String,
	tags: Array,
	id: Number
});

exports.note = mongoose.model('note', schema); //collection will be notes
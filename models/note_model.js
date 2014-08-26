var mongoose = require('../lib/mongoose');

var schema = mongoose.Schema({
	textarea: String,
	uri: Object,
	tags: Array,
	id: Array,
	note_id: String
});

exports.note = mongoose.model('note', schema); //collection will be notes
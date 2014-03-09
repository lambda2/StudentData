'use strict';

var mongoose = require('mongoose'),
		Schema = mongoose.Schema,
		ObjectId = Schema.ObjectId;

var fields = {
	login: { type: String },
	poste: { type: String },
	day: { type: Date , default: Date.now },
	hour: { type: String }
};

var eleveSchema = new Schema(fields);

module.exports = mongoose.model('presence_log', eleveSchema, 'presence_test');

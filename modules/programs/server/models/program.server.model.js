'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Program Schema
 */
var ProgramSchema = new Schema({
	code        : {type: String, default: ''},
	title       : {type: String, default: '', required: 'Title cannot be blank'},
	title_fr    : {type: String, default: '', required: 'Title cannot be blank'},
	department  : {type: String, default: '', required: 'Department cannot be blank'},
	short       : {type: String, default: '', required: 'Short description cannot be blank'},
	short_fr    : {type: String, default: '', required: 'Short description cannot be blank'},
	description : {type: String, default: ''},
	description_fr : {type: String, default: ''},
	owner       : {type: String, default: ''},
	website     : {type: String, default: ''},
	logo        : {type: String, default: 'modules/core/client/img/logo/canada.png'},
	tags        : [String],
	isPublished : {type: Boolean, default: false},
	created     : {type: Date, default: null},
	createdBy   : {type: 'ObjectId', ref: 'User', default: null },
	updated     : {type: Date, default: null },
	updatedBy   : {type: 'ObjectId', ref: 'User', default: null }
});

ProgramSchema.statics.findUniqueCode = function (title, title_fr, suffix, callback) {
	var _this = this;
	var possible = 'team-' + (title.toLowerCase().replace(/\W/g,'-').replace(/-+/,'-')) + '-equipe-' + (title_fr.toLowerCase().replace(/\W/g,'-').replace(/-+/,'-')) + (suffix || '');

	_this.findOne({
		code: possible
	}, function (err, user) {
		if (!err) {
			if (!user) {
				callback(possible);
			} else {
				return _this.findUniqueCode(title, title_fr, (suffix || 0) + 1, callback);
			}
		} else {
			callback(null);
		}
	});
};

mongoose.model('Program', ProgramSchema);

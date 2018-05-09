'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activitiesSchema = new Schema ({
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
    	ref: 'users'
	},
	ip: String,
	data: String,
	action_type: String,
	/*prev_revision: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'activity'
    },*/
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
	timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('activities', activitiesSchema);

'use strict';

const mongoose = require('mongoose')
	require('mongoose-double')(mongoose);
const Schema = mongoose.Schema;

const filesSchema = new Schema({
    user_id: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'usersModel'
    }],
	file: String

});

module.exports = mongoose.model('files', filesSchema);

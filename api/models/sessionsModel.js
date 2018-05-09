'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionsSchema = new Schema({
    sid: String,
    code: String,
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    session_type: {
        type: String,
        enum: ['mobile', 'web']
    },
    timestamp: { type: Date, default: Date.now } 
});

module.exports = mongoose.model('sessions', sessionsSchema);

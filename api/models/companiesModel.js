'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companiesSchema = new Schema({
    external_id: Number,
    name: {
        type: String,
        unique: true,
        required: true
    },
    /*client_of_company_id: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'company'
     },*/
    manager_user_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    phone_number: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true
    },
    /*prev_revision: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'company'
     },*/
    active: {type: Boolean, default: true},
    deleted: {type: Boolean, default: false},
    timestamp: {type: Date, default: Date.now}
});

module.exports = mongoose.model('companies', companiesSchema);

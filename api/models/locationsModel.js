'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationsSchema = new Schema({
    external_id: Number,
    name:
        {
            type: String,
            unique:true
        },
    manager_user_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    country: String,
    state: String,
    address: {
        street: String,
        line1: String,
        line2: String,        
        city: String,
        zip: Number
    },
    near_by: String,
    location: { latitude: String, longitude: String },
    company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'companies'
    },
    /*prev_revision: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'location'
    },*/
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('locations', locationsSchema);

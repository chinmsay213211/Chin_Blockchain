'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usersSchema = new Schema({
    external_id: Number,
    first_name: String,
    last_name: String,
    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true
    },
    company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'companies'
    },
    phone_number: {
        type: String,
        unique: true,
        require: true
    },
    invitation_code: String,
    role: {
        type: String,
        enum: ['account_manager', 'fork_lift_operator', 'warehouse_supervisor', 'driver', 'sales_manager', 'admin'],
        required: true
    },
    public_keys: [{
        type: String
    }],
    manager_user_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    /*prev_revision: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'users'
     },*/
    active: {type: Boolean, default: false},
    deleted: {type: Boolean, default: false},
    timestamp: {type: Date, default: Date.now}
});

module.exports = mongoose.model('users', usersSchema);

'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderTransportationsSchema = new Schema({
    request_from_company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'companies'
    },
    request_from_client_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    deliver_from_company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'companies'
    },
    deliver_to_company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'companies'
    },
    manager_user_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    driver_user_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    client_user_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    truck_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trucks'
    }],
    preorder_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'preOrders'
    },
    order_number: String,
    order_status: {
        type: String,
        enum: ['pending', 'in_process', 'processed', 'declined']
    },
    lots_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'lots'
    }],
    url_enabled: { type: Boolean, default: false },
    url_hash: String,
    url_hash_exp_time: Number,
    url_code: String,
    /*prev_revision: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order_transportation'
    },*/
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('orderTransportations', orderTransportationsSchema);

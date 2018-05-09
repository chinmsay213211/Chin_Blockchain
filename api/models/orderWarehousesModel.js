'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderWarehousesSchema = new Schema({
    owner_company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'companies'
    },
    owner_user_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    manager_user_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
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
    lots: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'lots'
    }],
    po_no: String,
    dispatch_no:String,
    qty: Number,
    url_enabled: { type: Boolean, default: false },
    url_hash: String,
    url_hash_exp_time: Number,
    url_code: String,
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('orderWarehouses', orderWarehousesSchema);

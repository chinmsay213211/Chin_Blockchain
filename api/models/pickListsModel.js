'use strict';

const mongoose = require('mongoose');
    require('mongoose-double')(mongoose);
const Schema = mongoose.Schema;

const pickListsSchema = new Schema({
    transportation_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'transportations'
    },
    order_transportation_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orderTransportations'
    },
    commodity_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'commodities'
    },
    lot_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'lots'
    }],
    product_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products'
    }],
    quantity: Number,
    storage_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'storages'
    }],
    company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'companies'
    },
    manager_user_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    status: {
        type: String,
        enum: ['pending', 'processed', 'declined']
    },
    fork_lift_operator_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    /*prev_revision: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'pick_list'
    },*/
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('pickLists', pickListsSchema);

'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transportationsSchema = new Schema({
    external_id: Number,
    order_transportation_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orderTransportations'
    },
    delivery_voucher_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'deliveryVouchers'
    }],
    action_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'actions'
    }],
    /*prev_revision: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'transportation'
    },*/
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('transportations', transportationsSchema);

'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const actionsSchema = new Schema({
    preorder_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'preOrders'
    },
    type: {
        type: String,
        enum: ['Packing List Accepted',
            'Packing List Confirmed',
            'ASN Generated',
            'WS Scanned products',
            'FO Notified',
            'FO Scanned products',
            'Receipt Confirmation Generated',
            'Stored']
    },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('actions', actionsSchema);

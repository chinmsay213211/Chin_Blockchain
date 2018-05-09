'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationsSchema = new Schema({
    type: {
        type: String,
        enum: [
            'order_confirmation',
            'order_warehousing',
            'order_transportation',
            'delivery_voucher']
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    name: String,
    description: String,
    status: {
        type: String,
        enum: ['pending', 'processed', 'declined'],
        default: 'pending'
    },
    preorder_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'preOrders'
    },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('notifications', notificationsSchema);

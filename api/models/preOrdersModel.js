'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const preOrdersSchema = new Schema({
        shipper: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'locations'
        },
        ship_to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'locations'
        },
        dispatch_no: String,
        client_user_ids: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }],
        company_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'companies'
        },
        manager_user_ids: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }],
        preorder_type: {
            type: String,
            enum: ['warehousing', 'transportation'],
            default: 'warehousing'
        },
        binary: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'files'
        },
        json: {
            type: String
        },
        statuses: [{
            user_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            },
            type: {
                type: String,
                enum:
                    ['Packing List Accepted',
                        'Packing List Confirmed',
                        'OCR started',
                        'OCR completed',
                        'ASN generated',
                        'WS notified',
                        'WS scanned products',
                        'FO notified',
                        'FO scanned products',
                        'Receipt Confirmation generated',
                        'Stored']
            },
            timestamp: {
                type: Date,
                default:
                Date.now
            }

        }],
        active: {
            type: Boolean,
            default:
                true
        },
        deleted: {
            type: Boolean,
            default:
                false
        },
        timestamp: {
            type: Date,
            default:
            Date.now
        }
    })
;

module.exports = mongoose.model('preOrders', preOrdersSchema);

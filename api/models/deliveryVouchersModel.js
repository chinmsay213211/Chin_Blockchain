'use strict';

const mongoose = require('mongoose')
    require('mongoose-double')(mongoose);
const SchemaTypes = mongoose.Schema.Types;
const Schema = mongoose.Schema;

const deliveryVouchersSchema = new Schema({
    number: Number,
    deliver_to_company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'companies'
    },
    manager_user_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    order_transportation_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'orderTransportations'
    },
    drops: [{
        from_location_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'locations'
        },
        to_location_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'locations'
        },
        lot_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'lots'
        }
    }],
    driver_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    truck_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'trucks'
    },
    opening_km: SchemaTypes.Double,
    closing_km: SchemaTypes.Double,
    total_km: SchemaTypes.Double,
    time_start: {type: Date, default: Date.now},
    time_end: {type: Date, default: Date.now},
    working_hours: SchemaTypes.Double,
    driving_hours: SchemaTypes.Double,
    rest_hours: SchemaTypes.Double,
    pdn_number: Number,
    delivery_status: {
        type: String,
        enum: ['pending', 'in_process', 'processed', 'declined']
    },
    confirmed_by_manager_user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    client_signature_image: String,
    client_signed_dv_photo: String,
    client_badge_photo: String,
    /*prev_revision: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'delivery_voucher'
     },*/
    active: {type: Boolean, default: true},
    deleted: {type: Boolean, default: false},
    timestamp: {type: Date, default: Date.now}
});

module.exports = mongoose.model('deliveryVouchers', deliveryVouchersSchema);

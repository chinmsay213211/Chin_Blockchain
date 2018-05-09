'use strict';

const mongoose = require('mongoose')
    require('mongoose-double')(mongoose);
const SchemaTypes = mongoose.Schema.Types;
const Schema = mongoose.Schema;

const productsSchema = new Schema({
    external_id: Number,
    name: {
        type: String,
        required: true,
        unique: true
    },
    serial_number: {
        type:String,
        required:true,
        unique:true
    },
    manager_user_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],

    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('products', productsSchema);

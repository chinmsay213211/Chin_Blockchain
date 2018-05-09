'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commoditiesSchema = new Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products'
    },
    external_id: String,
    name: {
        type: String,
        //unique: true
    },
    description: String,
    active: {type: Boolean, default: true},
    deleted: {type: Boolean, default: false},
    timestamp: {type: Date, default: Date.now}
});

module.exports = mongoose.model('commodities', commoditiesSchema);

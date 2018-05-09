'use strict';

const mongoose = require('mongoose')
    require('mongoose-double')(mongoose);
const SchemaTypes = mongoose.Schema.Types;
const Schema = mongoose.Schema;

const storagesSchema = new Schema({
    pallet_id: Number,
    rack_id: Number,
    occupied: { type: Boolean, default: false },
    location: { 
    	latitude: SchemaTypes.Double, 
    	longtitude: SchemaTypes.Double
    },
    storage_rating: String,
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('storages', storagesSchema);

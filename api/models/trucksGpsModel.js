'use strict';

const mongoose = require('mongoose')
    require('mongoose-double')(mongoose);
const SchemaTypes = mongoose.Schema.Types;
const Schema = mongoose.Schema;

const trucksGpsSchema = new Schema({
    trucks_ids: Number,
    location: {
        latitude: SchemaTypes.Double,
        longtitude: SchemaTypes.Double
    },
    plate_number: String,
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('trucksGps', trucksGpsSchema);

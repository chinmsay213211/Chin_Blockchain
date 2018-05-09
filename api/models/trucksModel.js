'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const trucksSchema = new Schema({
    external_id: Number,
    truck_makes_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'truckMakes'
    },
    truck_models_id: {
        type: mongoose.Schema.Types.ObjectId,
    	ref: 'truckModels'
    },
    number: String,
    plate_number: String,
    /*prev_revision: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'truck'
    },*/
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('trucks', trucksSchema);

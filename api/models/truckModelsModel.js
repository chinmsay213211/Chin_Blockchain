'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const trucksSchema = new Schema({
    truck_makes_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'truckMakes'
    },
    name: {
        type: String,
        unique: true,
        require: true
    },
    /*prev_revision: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'truck_model'
     },*/
    active: {type: Boolean, default: true},
    deleted: {type: Boolean, default: false},
    timestamp: {type: Date, default: Date.now}
});

module.exports = mongoose.model('truckModels', trucksSchema);

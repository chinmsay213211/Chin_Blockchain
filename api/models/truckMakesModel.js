'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const truckMakesSchema = new Schema({
    name:  {
        type: String,
        unique: true,
        require: true
    },
    /*prev_revision: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'truck_make'
    },*/
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('truckMakes', truckMakesSchema);

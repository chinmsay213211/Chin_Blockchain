'use strict';

const mongoose = require('mongoose')
    require('mongoose-double')(mongoose);
const SchemaTypes = mongoose.Schema.Types;
const Schema = mongoose.Schema;

const transportationLogsSchema = new Schema({
    transportation_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'transportations'
    },
    position: { 
        latitude: SchemaTypes.Double, 
        longitude: SchemaTypes.Double 
    },
    speed: SchemaTypes.Double,
    notes: String,
    priority: String,
    /*prev_revision: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'transportation_log'
    },*/
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('transportationLogs', transportationLogsSchema);

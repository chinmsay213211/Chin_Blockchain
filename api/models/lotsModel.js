'use strict';

const mongoose = require('mongoose')
	require('mongoose-double')(mongoose);
const SchemaTypes = mongoose.Schema.Types;
const Schema = mongoose.Schema;

const lotsSchema = new Schema({
	product_id: {
		type: mongoose.Schema.Types.ObjectId,
    	ref: 'products'
	},
	parent_lot_id: {
		type: mongoose.Schema.Types.ObjectId,
    	ref: 'lots'
	},
	owner_company_id: {
		type: mongoose.Schema.Types.ObjectId,
    	ref: 'companies'
	},
    owner_user_ids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
	manager_user_ids: [{
		type: mongoose.Schema.Types.ObjectId,
    	ref: 'users'
	}],
    lot_number: String,
    quantity: Number,
    net_weight: SchemaTypes.Double,
    gross_weight: SchemaTypes.Double,
    batch_number: String,
    // exp_date: { type: Date },
    exp_date:{ type: Date, default: Date.now },
    /*prev_revision: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'lot'
    },*/
    active: { type: Boolean, default: true },
	deleted: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('lots', lotsSchema);

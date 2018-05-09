'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const warehousesSchema = new Schema({
	external_id: Number,
	order_warehousing_id: {
		type: mongoose.Schema.Types.ObjectId,
    	ref: 'orderWarehouses'
	},
	lot_id: {
		type: mongoose.Schema.Types.ObjectId,
    	ref: 'lots'
	},
	product_id: {
		type: mongoose.Schema.Types.ObjectId,
    	ref: 'products'
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
	action_ids: [{
		type: mongoose.Schema.Types.ObjectId,
    	ref: 'actions'
	}],
	storage_ids: [{
		type: mongoose.Schema.Types.ObjectId,
    	ref: 'storages'
	}],
    batch_number: String,
    fork_lift_operator_user_id: {
		type: mongoose.Schema.Types.ObjectId,
    	ref: 'users'
	},
    active: { type: Boolean, default: true },
	deleted: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Warehouses', warehousesSchema);

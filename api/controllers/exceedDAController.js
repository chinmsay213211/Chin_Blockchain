
'use strict';

const config = require('config'),
    postgres = require('../helpers/postgres'),
    logger = require('../../logger');


exports.processDeliveryAdvice = function (customer_bill_to, ship_to, invoice_no, el_order_no, trip_no, sales_person,
                                       your_order_ref, buyer_name, date, due_date, currency, db_datetime, db_vehicle_no, db_name, db_signature,
                                       rb_name, b_designation, rb_id_details, signature_company_stamp,callback) {
    postgres.connect(function (err, client) {
        if (err) {
            callback(err);
        }
        else {
            client.query('INSERT INTO delivery_advice(customer_bill_to, ship_to, invoice_no, el_order_no, trip_no, sales_person, ' +
                'your_order_ref, buyer_name, date, due_date, currency, db_datetime, db_vehicle_no, db_name, db_signature, ' +
                'rb_name, b_designation, rb_id_details, signature_company_stamp) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, ' +
                '$11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING id', [customer_bill_to, ship_to, invoice_no, el_order_no,
                trip_no, sales_person, your_order_ref, buyer_name, date, due_date, currency, db_datetime, db_vehicle_no, db_name,
                db_signature, rb_name, b_designation, rb_id_details, signature_company_stamp], function (err, result) {

                if (err) {
                    callback(err);
                }
                else {
                    callback(null, result.rows[0].id);
                }

            });
        }
    });
};

exports.processDeliveryAdviceItems = function (item_code, product_description, uom, batch_number, shipped_qty, confirmed_qty, volume,unit_price,
                                    total_value,callback) {
    postgres.connect(function (err, client) {
        if (err) {
            callback(err);
        }
        else {
            client.query('INSERT INTO delivery_advice_items(item_code, product_description, uom, batch_number, shipped_qty, confirmed_qty,' +
                ' volume, unit_price, total_value ) ' +
                'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id', [item_code, product_description, uom, batch_number, shipped_qty,
                confirmed_qty, volume, unit_price, total_value], function (err, result) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, result.rows[0].id);
                }
            });
        }
    });
};


// when FO scans products
exports.scanProductFO = function (exceed_code, product_code, rack_id, pallet_id,callback) {
    postgres.connect(function (err, client) {
        if (err) {
            callback(err);
        }
        else {
            client.query('UPDATE product_scans SET rack_id = $1, pallet_id = $2 WHERE exceed_code = $3',
                [racket_id, pallet_id, exceed_code, product_code], function (err) {
                    if (err) {
                        callback(new Error(err));
                    }
                });
        }
    });
};
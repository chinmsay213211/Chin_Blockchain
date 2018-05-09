/**
 * Created by mediawhite on 16/07/17.
 */
'use strict';

const config = require('config'),
    postgres = require('../helpers/postgres'),
    logger = require('../../logger');


exports.processDeliveryVoucher = function (no, date, customer, vehicle, order_ref, openning_km,
                                          closing_km, total_km, tristar_out, tristar_in, working_hrs, rest_hrs, total_driving_hrs, pdn_no,
                                          no_of_drops, driver, drv, veh, ath,callback) {
    postgres.connect(function (err, client) {
        if (err) {
            callback(err);
        }
        else {
            client.query('INSERT INTO delivery_voucher(no, date, customer, vehicle, order_ref, openning_km, ' +
                'closing_km, total_km, tristar_out, tristar_in, working_hrs, rest_hrs, total_driving_hrs, pdn_no, ' +
                'no_of_drops, driver, drv, veh, ath ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, ' +
                '$11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING id', [no, date, customer, vehicle, order_ref, openning_km,
                closing_km, total_km, tristar_out, tristar_in, working_hrs, rest_hrs, total_driving_hrs, pdn_no,
                no_of_drops, driver, drv, veh, ath], function (err, result) {

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

exports.processDeliveryVoucherItems = function (s_no, product, qty, trip_from, trip_to, drop_no, site_in, site_out,callback) {
    postgres.connect(function (err, client) {
        if (err) {
            callback(err);
        }
        else {
            client.query('INSERT INTO delivery_voucher_items(s_no, product, qty, trip_from, trip_to, drop_no, site_in, site_out ) ' +
                'VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id', [s_no, product, qty, trip_from, trip_to, drop_no, site_in, site_out], function (err, result) {
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

// to print data after every 5 sec.

exports.processGpsTracking  = (function(location) {
            console.log(location);
});

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
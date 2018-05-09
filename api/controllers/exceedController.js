'use strict';

const config = require('config'),
    logger = require('../../logger');
let postgres = require('../helpers/postgres');
const loggerName = "[ExceedController]: ";

exports.processPackingList = function(shipper, ship_to, dispatch_no, date,
    driver_name, vehicle_no, container_no, issuedBy, shipments_total_net_weight,
    shipments_total_gross_weight, volume, no_of_packages, product_received_good_condit, callback) {
    postgres.connect(function(err, client, done) {
        if (err) {
            done();
            callback(err);
        } else {
            //TODO: Avoid duplication of product_code
            client.query('INSERT INTO packing_list(shipper, ship_to, dispatch_no, date, driver_name, vehicle_no, ' +
                'container_no, issued_by, shipments_total_net_weight, shipments_total_gross_weight, volume, ' +
                'no_of_packages, product_received_in_good_condit) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, ' +
                '$11, $12, $13) RETURNING id', [shipper, ship_to, dispatch_no, date,
                    driver_name, vehicle_no, container_no, issuedBy, shipments_total_net_weight,
                    shipments_total_gross_weight, volume, no_of_packages, product_received_good_condit
                ],
                function(err, result) {
                    done();
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, result.rows[0].id);
                    }

                });
        }
    });
};

exports.processPackingListItems = function(packing_list_id, no, product_name, lot_number, qty, net_wt, gross_wt,product_code, callback) {
    postgres.connect(function(err, client, done) {
        if (err) {
            done();
            callback(err);
        } else {
            //TODO: Avoid duplication of product_code
            client.query('INSERT INTO packing_list_items (packing_list_id, no, product_name, lot_number, qty, net_wt, gross_wt,product_code) ' +
                'VALUES ($1, $2, $3, $4, $5, $6, $7,$8) RETURNING id', [packing_list_id, no, product_name, lot_number, qty, net_wt, gross_wt,product_code],
                function(err, result) {
                    done();
                    if (err) {
                        callback(err);
                    } else {

                        callback(null, result.rows[0].id);
                    }
                });

        }
    });
};

// when WS scans products
exports.scanProductWS = function(packing_list_item, client_product_code, callback) {
    postgres.connect(function(err, client, done) {
        if (err) {
            done();
            callback(err);
        } else {
            //TODO: Avoid duplication of product_code
            client.query('INSERT INTO product_scans (product_code, exceed_code) VALUES($1, $2) RETURNING id', [client_product_code, client_product_code], function(err, code) {
                done();
                if (err) {
                    callback(err);
                } else {
                    callback(null, code.rows[0].id);
                }
            });
        }
    });
};


// when FO scans products
exports.getExceedCode = function(client_product_code, callback) {
    postgres.connect(function(err, client, done) {
        if (err) {
            done();
            callback(err);
        } else {
            client.query('select exceed_code from product_scans where product_code=$1', [client_product_code], function(err, result) {
                done();
                if (err) {
                    callback(err);
                } else {
                    const length = result.rows.length;
                    if (length >= 1) {
                        callback(null, result.rows[0].exceed_code);
                    } else {
                        callback(new Error("No product code found"));
                    }

                }
            });
        }
    });
};

// when FO scans products
exports.scanProductFO = function(exceed_code, rack_id, pallet_id, callback) {
    postgres.connect(function(err, client, done) {
        if (err) {
            done();
            callback(err);
        } else {
            client.query('UPDATE product_scans SET rack_id = $1, pallet_id = $2 WHERE exceed_code = $3', [rack_id, pallet_id, exceed_code], function(err, code) {
                done();
                if (err) {
                    callback(err);
                } else {
                    callback(null, code);
                }
            });
        }
    });
};


exports.generateASN = function(dispatch_no, storer, supplier, receiving_door, container_type, cust_ref, po_no, seal, qty, cust_po_no, asn_no, asn_type, created_by,
    return_reason, storer_class, receipt_srl_no, callback) {
    postgres.connect(function(err, client, done) {
        if (err) {
            done();
            callback(err);
        } else {
            client.query('INSERT INTO asn (dispatch_no, storer, supplier, receiving_door, container_type, cust_ref, po_no, seal, qty, ' +
                'cust_po_no, asn_no, asn_type, created_by, return_reason, storer_class, receipt_srl_no) ' +
                'VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id',
                [dispatch_no, storer, supplier, receiving_door, container_type, cust_ref, po_no, seal, qty, cust_po_no, asn_no, asn_type, created_by, return_reason, storer_class, receipt_srl_no],
                function(err, code) {
                    done();
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, code.rows[0].id);
                    }
                });
        }
    });
};

exports.generateASNItems = function(asn_id, sku, description, uom, p_qty, units, ti, hi, expected, recvd, foc,
    rejected, expiary, l_, w_, h_, each_, ip, case_, pallet, qty_in_cases, retail_sku, notes, mro, line_no, priority, site_code, gp_tag, qa_qs_flag,
    asn_items_asn_id_fk, gp_flag, callback) {
    postgres.connect(function(err, client, done) {
            if (err) {
                done();
                callback(err);
            } else {
                client.query('INSERT INTO asn_items (asn_id, sku, description,uom,p_qty,units,ti,hi,expected,recvd,foc,rejected,expiary,l_,w_,h_,each_,ip,case_,' +
                    'pallet,qty_in_cases,retail_sku,notes,mro,line_no,priority,site_code,gp_tag,qa_qs_flag,gp_flag) ' +
                'VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30) RETURNING id',
                [asn_id, sku, description, uom, p_qty, units, ti, hi, expected, recvd, foc, rejected, expiary, l_, w_, h_, each_, ip, case_,
     pallet, qty_in_cases, retail_sku, notes, mro, line_no, priority, site_code, gp_tag, qa_qs_flag,gp_flag],
                function(err, code) {
                    done();
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, code.rows[0].id);
                    }
                });
        };
    });
};

exports.generateReceiptConfirmation = function (aglty_asn, aglty_po, container, warehouse_ref, cust_code, cust_name, cust_ref, receipt_srl, supplier_code, supplier_name, cust_po, asn_close_date,
                                                carrier_code, carrier_name, storer_class, asn_last_activity, print_date, asn_created_by, asn_created_date,dispatch_no, callback) {
    postgres.connect(function (err, client, done) {
        if (err) {
            done();
            callback(err);
        } else {
            client.query('INSERT INTO receipt_confirmation (aglty_asn, aglty_po, container, warehouse_ref, cust_code, cust_name, cust_ref, receipt_srl, supplier_code, supplier_name, cust_po, asn_close_date,' +
                'carrier_code, carrier_name, storer_class,asn_last_activity,print_date,asn_created_by,asn_created_date,dispatch_no) ' +
                'VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,$16,$17,$18,$19,$20) RETURNING id',
                [aglty_asn, aglty_po, container, warehouse_ref, cust_code, cust_name, cust_ref, receipt_srl, supplier_code, supplier_name, cust_po, asn_close_date,carrier_code, carrier_name, storer_class, asn_last_activity, print_date, asn_created_by, asn_created_date,dispatch_no],
                function (err, code) {
                    done();
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, code.rows[0].id);
                    }
                });
        }
    });
};

exports.generateReceiptConfirmationItems = function (receipt_id,commodity, description, expected, received, foc, rejected, expiry_dt, coo, batch_no, uom, receipt_status, cbm, callback) {
    postgres.connect(function (err, client, done) {
        if (err) {
            done();
            callback(err);
        } else {
            client.query('INSERT INTO receipt_confirmation_items (commodity, description, expected, received, foc, rejected, expiry_dt, coo, batch_no, uom, receipt_status, cbm,receipt_confirmation_id) ' +
                'VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,$13) RETURNING id',
                [commodity, description, expected, received, foc, rejected, expiry_dt, coo, batch_no, uom, receipt_status, cbm,receipt_id],
                function (err, code) {
                    done();
                    if (err) {
                        callback(err);
                    } else {
                        callback(null, code.rows[0].id);
                    }
                });
        }
    });
};
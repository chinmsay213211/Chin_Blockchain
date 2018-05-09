'use strict';

const config = require('config'),
    postgres = require('../helpers/postgres'),
    logger = require('../../logger');

const loggerName = "[receiptconfirmationController]: ";

exports.getReceipts = function (req, res) {
    logger.debug(loggerName, "getReceipts executed");
    postgres.connect(function (err, client, done) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        } else {
            //TODO: Avoid duplication of product_code
            client.query('select * from receipt_confirmation',
                function (err, result) {
                    if (err) {
                        res.status(400).json({
                            success: false,
                            result: err
                        });
                    } else {
                        res.status(200).json(
                            {
                                success: true,
                                result: JSON.stringify(result.rows, null, "    ")
                            });
                    }
                });
        }
    });
};


exports.getReceipt = function (req, res) {
    logger.debug(loggerName, "getReceipt executed "+req.params.dispatch_no);
    postgres.connect(function (err, client, done) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        } else {
            //TODO: Avoid duplication of product_code
            client.query('select * from receipt_confirmation JOIN receipt_confirmation_items ON receipt_confirmation_items.receipt_confirmation_id=receipt_confirmation.id where receipt_confirmation.dispatch_no=$1',[req.params.dispatch_no],
                function (err, result) {

                    if (err) {
                        res.status(400).json({
                            success: false,
                            result: err
                        });
                    } else {
                        res.status(200).json(
                            {
                                success: true,
                                result: JSON.stringify(result.rows, null, "    ")
                            });
                    }
                });
        }
    });
};



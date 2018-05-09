'use strict';

const config = require('config'),
    postgres = require('../helpers/postgres'),
    logger = require('../../logger');

const loggerName = "[ansController]: ";

exports.getASNs = function (req, res) {
    logger.debug(loggerName, "getASNs executed");
    postgres.connect(function (err, client, done) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            client.query('select * from asn',
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


exports.getASN = function (req, res) {
    logger.debug(loggerName, "getASN executed " + req.params.dispatch_no);
    postgres.connect(function (err, client, done) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            client.query('select * from asn JOIN asn_items ON asn_items.asn_id=asn.id where asn.dispatch_no=$1', [req.params.dispatch_no],
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

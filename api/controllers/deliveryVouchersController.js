'use strict';

const mongoose = require('mongoose'),
    deliveryVouchersModel = mongoose.model('deliveryVouchers'),
    sendRabbitMQ = require('../rabbitmq/sendRabbitMQ'),
    path = require('path'),
    config = require('config'),
    deliveryVoucherConverter = require("../converters/deliveryVouchersConverter"),
    logger = require('../../logger'),
    util = require('util');

const loggerName = "[DeliveryVouchersController]: ";

exports.getDelivery_vouchers = function (req, res) {
    deliveryVouchersModel.find({}, function (err, delivery_vouchers) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json({
                success: true,
                result: delivery_vouchers
            });
        }
    });
};

exports.createDelivery_voucher = function (req, res) {
    logger.debug(loggerName, "createDeliveryVouchers executed with " + util.inspect(req.body));
    let newDeliveryVoucher = new deliveryVouchersModel(req.body);

    newDeliveryVoucher.save(function (err, savedDeliveryVoucher) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            let args = [JSON.stringify(deliveryVoucherConverter.convertToChaincode(savedDeliveryVoucher))];
            sendRabbitMQ.send(config.DELIVERY_VOUCHERS_CHAINCODE, "create", args,function (err,result) {
                if(err)
                {
                    res.status(400).json({
                        success: false,
                        result: err
                    });
                }
                else
                {
                    if(result.success)
                    {
                        res.status(200).json({
                            success: true,
                            result: savedDeliveryVoucher
                        });
                    }
                    else
                    {
                        res.status(400).json({
                            success: false,
                            result: result.result
                        });
                    }
                }
            });

        }
    });
};

exports.getDelivery_voucher = function (req, res) {
    deliveryVouchersModel.findById(req.params.delivery_voucherId, function (err, delivery_voucher) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json({
                success: true,
                result: delivery_voucher
            });
        }
    });
};

exports.updateDelivery_voucher = function (req, res) {
    deliveryVouchersModel.findOneAndUpdate({_id: req.params.delivery_voucherId}, req.body, {new: true}, function (err, delivery_voucher) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            let args = [JSON.stringify(deliveryVoucherConverter.convertToChaincode(delivery_voucher))];
            sendRabbitMQ.send(config.DELIVERY_VOUCHERS_CHAINCODE, "update", args,function (err,result) {
                if(err)
                {
                    res.status(400).json({
                        success: false,
                        result: err
                    });
                }
                else
                {
                    if(result.success)
                    {
                        res.status(200).json({
                            success: true,
                            result: delivery_voucher
                        });
                        logger.info(loggerName, 'Delivery Voucher updated');
                    }else
                    {
                        res.status(400).json({
                            success: false,
                            result: result.result
                        });
                    }
                }
            });
        }
    });
};

exports.deleteDelivery_voucher = function (req, res) {
    deliveryVouchersModel.findOneAndUpdate({_id: req.params.delivery_voucherId}, {deleted: true}, {new: true}, function (err, delivery_voucher) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json({
                success: true,
                result: {message: 'delivery_voucher succesfully deleted'}
            });
            logger.info(loggerName, 'Delivery Voucher Deleted');
        }
    });
};

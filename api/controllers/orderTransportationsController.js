'use strict';

const mongoose = require('mongoose'),
    orderTransportationsModel = mongoose.model('orderTransportations'),
    sendRabbitMQ = require('../rabbitmq/sendRabbitMQ'),
    config = require('config'),
    orderTransportationsConverter = require("../converters/orderTransportationsConverter"),
    logger = require('../../logger');

const loggerName = "[OrderTransportationsController]: ";

exports.getOrder_transportations = function (req, res) {
    orderTransportationsModel.find({}, function (err, order_transportations) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json(
                {
                    success: true,
                    result: order_transportations
                });
        }
    });
};

exports.createOrder_transportation = function (req, res) {
    let newOrderTransportation = new orderTransportationsModel(req.body);

    newOrderTransportation.save(function (err, savedOrderTransportation) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            let args = [JSON.stringify(orderTransportationsConverter.convertToChaincode(savedOrderTransportation))];
            sendRabbitMQ.send(config.ORDER_TRANSPORTATIONS_CHAINCODE, "create", args, function (err, result) {
                if (err) {
                    res.status(400).json(
                        {
                            success: false,
                            result: err
                        });
                }
                else {
                    if (result.success) {
                        res.status(200).json(
                            {
                                success: true,
                                result: savedOrderTransportation
                            });
                    }
                    else {
                        res.status(400).json(
                            {
                                success: false,
                                result: result.result
                            });
                    }
                }
            });

        }
    });
};

exports.getOrder_transportation = function (req, res) {
    orderTransportationsModel.findById(req.params.order_transportationId, function (err, order_transportation) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json(
                {
                    success: true,
                    result: order_transportation
                });
        }
    });
};

exports.updateOrder_transportation = function (req, res) {
    orderTransportationsModel.findOneAndUpdate({_id: req.params.order_transportationId}, req.body, {new: true}, function (err, order_transportation) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            let args = [JSON.stringify(orderTransportationsConverter.convertToChaincode(order_transportation))];
            sendRabbitMQ.send(config.ORDER_TRANSPORTATIONS_CHAINCODE, "update", args,function (err,result) {
                if(err)
                {
                    res.status(400).json(
                        {
                            success: false,
                            result: err
                        });
                }
                else
                {
                    if(result.success)
                    {
                        res.status(200).json(
                            {
                                success: true,
                                result: order_transportation
                            });
                        logger.info(loggerName, 'order transportation updated');
                    }
                    else
                    {
                        res.status(400).json(
                            {
                                success: false,
                                result: result.result
                            });
                    }
                }
            });
        }
    });
};

exports.deleteOrder_transportation = function (req, res) {
    orderTransportationsModel.findOneAndUpdate({_id: req.params.order_transportationId}, {deleted: true}, {new: true}, function (err, order_transportation) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json(
                {
                    success: true,
                    result: {message: 'order_transportation successfully deleted'}
                });
            logger.info(loggerName, 'order transportation Deleted');
        }
    });
};

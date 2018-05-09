'use strict';

const mongoose = require('mongoose'),
    orderWarehousesModel = mongoose.model('orderWarehouses'),
    sendRabbitMQ = require('../rabbitmq/sendRabbitMQ'),
    config = require('config'),
    orderWarehousingConverter = require("../converters/orderWarehousesConverter"),
    logger = require('../../logger'),
    util = require('util');

const loggerName = "[OrderwarehousesController]: ";

exports.getOrder_warehousings = function (req, res) {
    orderWarehousesModel.find({}, function (err, order_warehousings) {
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
                    result: order_warehousings
                });
        }
    });
};

exports.createOrder_warehousing = function (req, res) {
    logger.debug(loggerName, util.inspect(req.body, {showHidden: false}));
    let newOrderWarehousing = new orderWarehousesModel(req.body);

    newOrderWarehousing.save(function (err, savedOrderWarehousing) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            let args = [JSON.stringify(orderWarehousingConverter.convertToChaincode(savedOrderWarehousing))];
            sendRabbitMQ.send(config.ORDER_WAREHOUSES_CHAINCODE, "create", args, function (err, result) {
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
                                result: savedOrderWarehousing
                            });
                    } else {
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

exports.getOrder_warehousing = function (req, res) {
    orderWarehousesModel.findById(req.params.order_warehousingId, function (err, order_warehousing) {
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
                    result: order_warehousing
                });
        }
    });
};

exports.getOrderWarehousesByPreOrderId = function (req, res) {
    logger.debug(loggerName, "getOrderWarehousesByPreOrderId executed with: " + req.params.preorder_id);
    orderWarehousesModel.find({preorder_id: req.params.preorder_id})
    .populate('order_status')
    .populate({
	path: 'lots',
	populate: {
		path: 'product_id'
	}
    })
    .exec(function (err, order_warehousing) {
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
                    result: order_warehousing
                });
            }
        });
};

exports.updateOrder_warehousing = function (req, res) {
    orderWarehousesModel.findOneAndUpdate({_id: req.params.order_warehousingId}, req.body, {new: true}, function (err, order_warehousing) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {


            let args = [JSON.stringify(orderWarehousingConverter.convertToChaincode(order_warehousing))];
            sendRabbitMQ.send(config.ORDER_WAREHOUSES_CHAINCODE, "update", args, function (err, result) {
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
                                result: order_warehousing
                            });
                        logger.info(loggerName, 'Orderwarehouse updated');
                    } else {
                        res.status(400).json(
                            {
                                success: false,
                                result: result.result
                            });
                        logger.info(loggerName, 'Orderwarehouse updated');
                    }
                }
            });
        }
    });
};

exports.deleteOrder_warehousing = function (req, res) {
    orderWarehousesModel.findOneAndUpdate({_id: req.params.order_warehousingId}, {deleted: true}, {new: true}, function (err, order_warehousing) {
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
                    result: {message: 'order_warehousing successfully deleted'}
                });
            logger.info(loggerName, 'Orderwarehouse Deleted');
        }
    });
};

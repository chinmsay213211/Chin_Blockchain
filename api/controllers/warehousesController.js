'use strict';

const mongoose = require('mongoose'),
    warehousesModel = mongoose.model('Warehouses'),
    sendRabbitMQ = require('../rabbitmq/sendRabbitMQ'),
    config = require('config'),
    warehousingsConverter = require("../converters/warehousesConverter"),
    logger = require('../../logger');

const loggerName = "[WarehousesController]: ";

exports.getWarehouses = function (req, res) {
    warehousesModel.find({}, function (err, warehouses) {
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
                    result: warehouses
                });
        }
    });
};

exports.createWarehouse = function (req, res) {
    let newWarehouse = new warehousesModel(req.body);

    newWarehouse.save(function (err, savedWarehouse) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            let args = [JSON.stringify(warehousingsConverter.convertToChaincode(savedWarehouse))];
            sendRabbitMQ.send(config.WAREHOUSES_CHAINCODE, "create", args, function (err, result) {
                if (err) {
                    res.status(400).json(
                        {
                            success: false,
                            result: err
                        });
                } else {
                    if (result.success) {
                        res.status(200).json(
                            {
                                success: true,
                                result: savedWarehouse
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

exports.getWarehouse = function (req, res) {
    warehousesModel.findById(req.params.warehouseId, function (err, warehouse) {
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
                    result: warehouse
                });
        }
    });
};

exports.updateWarehouse = function (req, res) {
    warehousesModel.findOneAndUpdate({_id: req.params.warehouseId}, req.body, {new: true}, function (err, warehouse) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {

            let args = [JSON.stringify(warehousingsConverter.convertToChaincode(warehouse))];
            sendRabbitMQ.send(config.WAREHOUSES_CHAINCODE, "update", args, function (err, result) {
                if (err) {
                    res.status(400).json(
                        {
                            success: false,
                            result: err
                        });
                } else {
                    if (result.success) {
                        res.status(200).json(
                            {
                                success: true,
                                result: warehouse
                            });
                        logger.info(loggerName, 'Warehouse updated');

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

exports.deleteWarehouse = function (req, res) {
    warehousesModel.findOneAndUpdate({_id: req.params.warehouseId}, {deleted: true}, {new: true}, function (err, warehouse) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json({success: true, result: {message: 'warehouse successfully deleted'}});
            logger.info(loggerName, 'Warehouse deleted');
        }
    });
};

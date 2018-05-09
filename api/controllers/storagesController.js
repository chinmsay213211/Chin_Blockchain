'use strict';

const mongoose = require('mongoose'),
    storagesModel = mongoose.model('storages'),
    sendRabbitMQ = require('../rabbitmq/sendRabbitMQ'),
    config = require('config'),
    storageConverter = require("../converters/storagesConverter"),
    logger = require('../../logger');

const loggerName = "[StoragesController]: ";


exports.getStorages = function (req, res) {
    storagesModel.find({}, function (err, storages) {
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
                    result: storages
                });
        }
    });
};

exports.createStorage = function (req, res) {
    let newStorage = new storagesModel(req.body);

    newStorage.save(function (err, savedStorage) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            let args = [JSON.stringify(storageConverter.convertToChaincode(savedStorage))];
            sendRabbitMQ.send(config.STORAGES_CHAINCODE, "create", args, function (err, result) {
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
                                result: savedStorage
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

exports.getStorage = function (req, res) {
    storagesModel.findById(req.params.storageId, function (err, storage) {
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
                    result: storage
                });
        }
    });
};

exports.updateStorage = function (req, res) {
    storagesModel.findOneAndUpdate({_id: req.params.storageId}, req.body, {new: true}, function (err, storage) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {

            let args = [JSON.stringify(storageConverter.convertToChaincode(storage))];
            sendRabbitMQ.send(config.STORAGES_CHAINCODE, "update", args, function (err, result) {
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
                                result: storage
                            });
                        logger.info(loggerName, 'Storage updated');
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

exports.deleteStorage = function (req, res) {
    storagesModel.findOneAndUpdate({_id: req.params.storageId}, {deleted: true}, {new: true}, function (err, storage) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json({success: true, result: {message: 'storage successfully deleted'}});
            logger.info(loggerName, 'Storage Deleted');
        }
    });
};

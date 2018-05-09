'use strict';

const mongoose = require('mongoose'),
    productsModel = mongoose.model('products'),
    sendRabbitMQ = require('../rabbitmq/sendRabbitMQ'),
    config = require('config'),
    productsConverter = require("../converters/productsConverter"),
    logger = require('../../logger'),
    util = require('util');

const loggerName = "[ProductsController]: ";

exports.getProducts = function (req, res) {
    logger.info(loggerName, "getProducts executed");
    productsModel.find({}, function (err, products) {
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
                    result: products
                });
        }
    });
};

exports.createProduct = function (req, res) {
    logger.info(loggerName, "createProduct executed with " + util.inspect(req.body, {showHidden: false}));
    let newProduct = new productsModel(req.body);

    newProduct.save(function (err, savedProduct) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            let args = [JSON.stringify(productsConverter.convertToChaincode(savedProduct))];
            sendRabbitMQ.send(config.PRODUCTS_CHAINCODE, "create", args, function (err, result) {
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
                                result: savedProduct
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

exports.getProduct = function (req, res) {
    logger.info(loggerName, "getProduct executed");
    productsModel.findById(req.params.productId, function (err, product) {
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
                    result: product
                });
        }
    });
};

exports.updateProduct = function (req, res) {
    productsModel.findOneAndUpdate({_id: req.params.productId}, req.body, {new: true}, function (err, product) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {

            let args = [JSON.stringify(productsConverter.convertToChaincode(product))];
            sendRabbitMQ.send(config.PRODUCTS_CHAINCODE, "update", args, function (err, result) {
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
                                result: product
                            });
                        logger.info(loggerName, "Product updated");

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

exports.deleteProduct = function (req, res) {
    productsModel.findOneAndUpdate({_id: req.params.productId}, {deleted: true}, {new: true}, function (err, product) {
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
                    result: {message: 'product successfully deleted'}
                });
            logger.info(loggerName, "Product deleted");
        }
    });
};

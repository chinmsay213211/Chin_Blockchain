'use strict';

const mongoose = require('mongoose'),
    trucksGpsModel = mongoose.model('trucksGps'),
    sendRabbitMQ = require('../rabbitmq/sendRabbitMQ'),
    config = require('config'),
    trucksConverter = require("../converters/trucksConverter");

exports.getTrucksGps = function (req, res) {
    trucksGpsModel.find({}, function (err, trucks) {
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
                    result: trucks
                });
        }
    });
};

exports.createTrucksGps = function (req, res) {
    let newTrucksGps = new trucksGpsModel(req.body);

    newTrucksGps.save(function (err, savedTrucksGps) {
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
                    result: savedTrucksGps
                });
        }
    });
};


"use strict";

const mongoose = require('mongoose'),
    logger = require('../../logger'),
    ocrController = require('./ocrController'),
    preOrdersModel = mongoose.model('preOrders'),
    preOrdersConverter = require('../converters/preOrdersConverter'),
    trucksGpsController = require('./trucksGpsController'),
    config = require('config');

const loggerName = '[SimulatorController]: ';

exports.simulateConfirmation = function (preOrders) {
    logger.debug(loggerName, "simulateConfirmation executed");

    preOrdersModel.update({_id: preOrders._id}, { $set: {status: 'processed'}}, function (err, affected, resp) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            ocrController.processImage(preOrders.json);
        }
    });
};

exports.simulateTruckDriving = function () {
    logger.debug(loggerName, "simulateConfirmation executed");

    var args = [JSON.stringify(trucksGpsController.createTrucksGps(trucks_ids,locations,plate_number))];
        if (err) {
            logger.error(loggerName, err);
            throw err;
        }
};
'use strict';

const mongoose = require('mongoose'),
    sessionsModel = mongoose.model('sessions'),
    logger = require('../../logger');

const loggerName = "[SessionsController]: ";

exports.getSessions = function (req, res) {
    sessionsModel.find({}, function (err, sessions) {
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
                    result: sessions
                });
        }
    });
};

exports.createSession = function (req, res) {
    let new_session = new sessionsModel(req.body);
    new_session.save(function (err, session) {
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
                    result: session
                });
        }
    });
};

exports.getSession = function (req, res) {
    sessionsModel.findById(req.params.sessionId, function (err, session) {
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
                    result: session
                });
        }
    });
};

exports.updateSession = function (req, res) {
    sessionsModel.findOneAndUpdate({_id: req.params.sessionId}, req.body, {new: true}, function (err, session) {
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
                    result: session
                });
            logger.info(loggerName, 'Session updated');
        }
    });
};

exports.deleteSession = function (req, res) {
    // Fixme: Confirm removing the session
    sessionsModel.remove({_id: req.params.sessionId}, function (err, session) {
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
                    result: {message: 'session successfully deleted'}
                });
            logger.info(loggerName, 'Session Deleted');
        }
    });
};

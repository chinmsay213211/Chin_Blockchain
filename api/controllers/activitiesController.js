'use strict';

const mongoose = require('mongoose'),
    activitiesModel = mongoose.model('activities'),
    logger = require('../../logger'),
    util = require('util');

const loggerName = "[ActivitiesController]: ";

exports.getActivities = function (req, res) {
    activitiesModel.find({}, function (err, activities) {
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
                    result: activities
                });
        }
    });
};

exports.createActivity = function (req, res) {
    logger.debug(loggerName, "createAction executed with " + util.inspect(req.body));
    let new_activity = new activitiesModel(req.body);
    new_activity.save(function (err, activity) {
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
                    result: activity
                });
        }
    });
};

exports.getActivity = function (req, res) {
    activitiesModel.findById(req.params.activityId, function (err, activity) {
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
                    result: activity
                });
        }
    });
};

exports.updateActivity = function (req, res) {
    activitiesModel.findOneAndUpdate({_id: req.params.activityId}, req.body, {new: true}, function (err, activity) {
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
                    result: activity
                });
        }
    });
};

exports.deleteActivity = function (req, res) {
    activitiesModel.findOneAndUpdate({_id: req.params.activityId}, {deleted: true}, {new: true}, function (err, activity) {
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
                    result:{message: 'Activity successfully deleted'}
                });
        }
    });
};

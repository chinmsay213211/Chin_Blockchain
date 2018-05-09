'use strict';

const mongoose = require('mongoose'),
    notificationsModel = mongoose.model('notifications'),
    config = require('config'),
    logger = require('../../logger'),
    usersModel = require('../models/usersModel'),
    async = require('async'),
    notificationHelper = require('../helpers/notificationHelper');

const loggerName = "[NotificationsController]: ";

exports.getNotifications = function (req, res) {
    logger.debug(loggerName, "getNotifications executed for " + req.decoded._id);

    notificationsModel.find({user_id: req.decoded._id}, function (err, notifications) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        } else {
            res.status(200).json({
                success: true,
                result: notifications
            });
        }
    });

};

exports.getNotificationsCount = function (req, res) {
    logger.debug(loggerName, "getNotificationsCount executed for " + req.decoded._id);
    notificationsModel.count({user_id: req.decoded._id}, function (err, notificationsCount) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        } else {
            res.status(200).json({
                success: true,
                result: notificationsCount
            });
        }
    });
};

exports.createNotificationsByRole = function (req, role, type, name, description, callback) {
    logger.debug(loggerName, "createNotificationsByRole executed with args: " + role + ", " + type + ", " + name + ", " + description);
    usersModel.find({role: role}, function (err, users) {
        if (err) {
            logger.debug(loggerName, err);
            return;
        }

        async.map(users, function (user, callback) {
            exports.createNotification(req, type, role, user._id, name, description, callback);
        }, function (error, results) {
            if (error) {
                logger.error(loggerName + "{createNotificationsByRole}: ", error);
                callback(error);
            }
            callback();
        });
    });
};

exports.createNotification = function (req, type, role, userId, name, description, callback) {
    logger.debug(loggerName, "createNotification executed with args: " + type + ", " + userId + ", " + name + ", " + description);
    let newNotification = new notificationsModel({
        type: type,
        user_id: userId,
        name: name,
        description: description
    });

    logger.debug(loggerName, "createNotification executed with: \n" + newNotification);

    newNotification.save(function (err, savedNotification) {
        if (err) {
            callback(err, savedNotification);
        }
        req.io.emit(role, JSON.stringify(savedNotification));
        callback(null, savedNotification);
    });
};

exports.getNotification = function (req, res) {
    notificationsModel.findById(req.params.notificationId, function (err, notification) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json({
                success: true,
                result: notification
            });
        }
    });
};

exports.deleteNotification = function (req, res) {
    notificationsModel.findOneAndUpdate({_id: req.params.notificationId}, {deleted: true}, {new: true}, function (err, notification) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            res.status(200).json({
                success: true,
                result: {message: 'Notification successfully deleted'}
            });
            logger.info(loggerName, 'Notification Deleted');
        }
    });
};


global.eventEmitter.on(global.sendBulkNotification, function (type, requester_userId, preorderId, notification_attachment_id) {
    notificationHelper.sendBulkNotification(type,requester_userId,preorderId,notification_attachment_id);
});

global.eventEmitter.on(global.sendNotification, function (userid, type, message, status, preorder_id) {
    let newNotification = new notificationsModel({
        type: type,
        user_id: userid,
        name: message.name,
        description: message.description,
        status: status,
        preorder_id: preorder_id
    });
    newNotification.save(function (err, savedNotification) {
        if (err) {
            //TODO: Send Notification system error to System Admin
        }
        else {
            global.io.emit(userid, JSON.stringify(savedNotification));
        }
    });
});
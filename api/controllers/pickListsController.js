'use strict';

let mongoose = require('mongoose'),
    pickListsModel = mongoose.model('pickLists'),
    sendRabbitMQ = require('../rabbitmq/sendRabbitMQ'),
    config = require('config'),
    pickListConverter = require("../converters/pickListsConverter"),
    logger = require('../../logger');

const loggerName = "[PicklistsController]: ";

exports.getPick_lists = function (req, res) {
    pickListsModel.find({}, function (err, pick_lists) {
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
                    result: pick_lists
                });
        }
    });
};

exports.createPick_list = function (req, res) {
    let newPickList = new pickListsModel(req.body);

    newPickList.save(function (err, savedPickList) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            let args = [JSON.stringify(pickListConverter.convertToChaincode(savePickList))];
            sendRabbitMQ.send(config.PICK_LISTS_CHAINCODE, "create", args, function (err, result) {
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
                                result: savedPickList
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

exports.getPick_list = function (req, res) {
    pickListsModel.findById(req.params.pick_listId, function (err, pick_list) {
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
                    result: pick_list
                });
        }
    });
};

exports.updatePick_list = function (req, res) {
    pickListsModel.findOneAndUpdate({_id: req.params.pick_listId}, req.body, {new: true}, function (err, pick_list) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {

            let args = [JSON.stringify(pickListConverter.convertToChaincode(pick_list))];
            sendRabbitMQ.send(config.PICK_LISTS_CHAINCODE, "update", args,function (err,result) {
                if(err)
                {
                    res.status(400).json(
                        {
                            success: false,
                            result: err
                        });
                }else
                {
                    if(result.success)
                    {
                        res.status(200).json(
                            {
                                success: true,
                                result: pick_list
                            });
                        logger.info(loggerName, 'Picklist updated');
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

exports.deletePick_list = function (req, res) {
    pickListsModel.findOneAndUpdate({_id: req.params.pick_listId}, {deleted: true}, {new: true}, function (err, pick_list) {
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
                    result: {message: 'pick_list successfully deleted'}
                });
            logger.info(loggerName, 'Picklist Deleted');
        }
    });
};

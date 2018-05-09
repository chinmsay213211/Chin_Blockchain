'use strict';

const mongoose = require('mongoose'),
    companiesModel = mongoose.model('companies'),
    sendRabbitMQ = require('../rabbitmq/sendRabbitMQ'),
    config = require('config'),
    logger = require('../../logger'),
    companyConverter = require("../converters/companiesConverter"),
    util = require("util");
const loggerName = "[CompaniesController]: ";

exports.getCompanies = function (req, res) {
    companiesModel.find({}, function (err, companies) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        } else {
            res.status(200).json({
                success: true,
                result: companies
            });
        }
    });
};

exports.createCompany = function (req, res) {
    logger.debug("createCompanies executed with " + util.inspect(req.body));
    let newCompany = new companiesModel(req.body);

    newCompany.save(function (err, savedCompany) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        } else {
            let args = [JSON.stringify(companyConverter.convertToChaincode(savedCompany))];
            sendRabbitMQ.send(config.COMPANIES_CHAINCODE, "create", args,function (err,result) {
                if(err)
                {
                    res.status(400).json({
                        success: false,
                        result: err
                    });
                }
                else
                {
                    if(result.success)
                    {
                        res.status(200).json({
                            success: true,
                            result: savedCompany
                        });
                    }
                    else
                    {
                        res.status(400).json({
                            success: false,
                            result: result.result
                        });
                    }
                }
            });

        }
    });
};

exports.getCompany = function (req, res) {
    companiesModel.findById(req.params.companyId, function (err, company) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        } else {
            res.status(200).json({
                success: true,
                result: company
            });
        }
    });
};

exports.updateCompany = function (req, res) {
    companiesModel.findOneAndUpdate({_id: req.params.companyId}, req.body, {new: true}, function (err, company) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        } else {

            let args = [JSON.stringify(companyConverter.convertToChaincode(company))];
            sendRabbitMQ.send(config.COMPANIES_CHAINCODE, "update", args,function (err,result) {
                if(err)
                {
                    res.status(400).json({
                        success: false,
                        result: err
                    });
                }else
                {
                    if(result.success)
                    {
                        res.status(200).json({
                            success: true,
                            result: company
                        });
                        logger.info(loggerName, 'Company updated');
                    }
                    else
                    {
                        res.status(200).json({
                            success: false,
                            result: result.result
                        });
                    }
                }
            });
        }
    });
};

exports.deleteCompany = function (req, res) {
    companiesModel.findOneAndUpdate({_id: req.params.companyId}, {deleted: true}, {new: true}, function (err, company) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        } else {
            res.status(200).json({success:true,result:{message: 'company successfully deleted'}});
            logger.info(loggerName, 'Company Deleted');
        }
    });
};

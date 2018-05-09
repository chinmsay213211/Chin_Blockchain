'use strict';

const mongoose = require('mongoose'),
    preOrdersModel = mongoose.model('preOrders'),
    lotsModel = mongoose.model('lots'),
    productsModel = mongoose.model('products'),
    orderWarehousesModel = mongoose.model('orderWarehouses'),
    sendRabbitMQ = require('../rabbitmq/sendRabbitMQ'),
    config = require('config'),
    preorderConverter = require("../converters/preOrdersConverter"),
    ocrController = require('./ocrController'),
    logger = require('../../logger'),
    exceedController = require('./exceedController'),
    util = require('util'),
    async = require('async'),
    lotConverter = require("../converters/lotsConverter"),
    orderWarehousingConverter = require("../converters/warehousesConverter"),
    notificationsController = require('./notificationsController');
const events = require('events');
const eventEmitter = new events.EventEmitter();

const loggerName = "[PreOrdersController]: ";

exports.getPreorders = function (req, res) {
    logger.debug(loggerName, "getPreorders executed");
    preOrdersModel.find({}).populate("company_id").populate('shipper').populate('ship_to').exec(function (err, preorders) {
        if (err) {
            logger.error(loggerName, err);
            res.status(400).json({
                success: false,
                result: err
            });
        } else {
            res.status(200).json({
                success: true,
                result: preorders
            });
        }
    });
};

exports.getSmallPreorders = function (req, res) {
    logger.debug(loggerName, "getSmallPreorders executed");
    preOrdersModel.find({}).populate("company_id").populate("shipper").populate("ship_to").exec(function (err, preorders) {
        if (err) {
            logger.error(loggerName, err);
            res.status(400).json({
                success: false,
                result: err
            });
        } else {
            var smallPreorders = [];
            for (let i = 0; i < preorders.length; i++) {
                let data = {};
                data['_id'] = preorders[i]['_id'];
                data['shipper'] = preorders[i]['shipper'];
                data['ship_to'] = preorders[i]['ship_to'];
                data['dispatch_no'] = preorders[i]['dispatch_no'];
                data['company_id'] = preorders[i]['company_id'];
                data['client_user_ids'] = preorders[i]['client_user_ids'];
                data['manager_user_ids'] = preorders[i]['manager_user_ids'];
                data['preorder_type'] = preorders[i]['preorder_type'];
                data['statuses'] = preorders[i]['statuses'];
                data['active'] = preorders[i]['active'];
                data['deleted'] = preorders[i]['deleted'];
                data['timestamp'] = preorders[i]['timestamp'];
                smallPreorders.push(data);
            }

            res.status(200).json({
                success: true,
                result: smallPreorders
            });
        }
    });
};

exports.getPreorder = function (req, res) {
    logger.debug(loggerName, "getPreorder executed with \n" + util.inspect(req.params, {
        showHidden: false
    }));
    preOrdersModel.findById(req.params.preorderId).populate('shipper').populate('ship_to').populate('company_id').populate('statuses.user_id').populate('manager_user_ids').populate('client_user_ids').exec(function (err, preorder) {
        if (err) {
            logger.error(loggerName, err);
            res.status(400).json({
                success: false,
                result: err
            });
        } else {
            res.status(200).json({
                success: true,
                result: preorder
            });
        }
    });
};

exports.updatePreorder = function (req, res) {
    logger.debug(loggerName, "updatePreorder executed with\n" + util.inspect(req.body, {
        showHidden: false
    }));
    preOrdersModel.findOneAndUpdate({
        _id: req.params.preorderId
    }, req.body, {
        new: true
    }, function (err, preorder) {
        if (err) {
            logger.error(loggerName, err);
            res.status(400).json({
                success: false,
                result: err
            });
        } else {


            let args = [JSON.stringify(preorderConverter.convertToChaincode(preorder))];
            sendRabbitMQ.send(config.PREORDERS_CHAINCODE, "update", args, function (err, result) {
                if (err) {
                    res.status(400).json({
                        success: false,
                        result: err
                    });
                }
                else {
                    if (result.success) {
                        res.status(200).json({
                            success: true,
                            result: preorder
                        });
                        logger.info(loggerName, 'Piclist updated');
                    } else {
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


exports.confirmPreOrder = function (req, res) {
    const preOrderId = req.params.preorderId;
    // logger.debug(loggerName, "confirmPreOrder executed with " + util.inspect(req.params, {
    //     showHidden: false
    // }));
    //
    //
    // preOrdersModel.findById(preOrderId, function (err, preOrder) {
    //     if (err) {
    //         logger.error(loggerName, err);
    //         res.status(400).json({
    //             success: false,
    //             result: err
    //         });
    //     }
    //
    //     preOrder.statuses.push({
    //         type: 'Packing List Confirmed',
    //         user_id: req.decoded._id
    //     });
    //     preOrder.statuses.push({
    //         type: 'OCR started',
    //         user_id: req.decoded._id
    //     });
    //     preOrder.statuses.push({
    //         type: 'OCR completed',
    //         user_id: req.decoded._id
    //     });
    //     preOrder.statuses.push({
    //         type: 'ASN generated',
    //         user_id: req.decoded._id
    //     });
    //     preOrder.statuses.push({
    //         type: 'WS notified',
    //         user_id: req.decoded._id
    //     });
    //
    //     preOrder.markModified('statuses');
    //     preOrder.save(function (err) {
    //         if (err) {
    //             logger.error(loggerName, err);
    //             res.status(400).json({
    //                 success: false,
    //                 result: err
    //             });
    //         } else {
    //             let args = [JSON.stringify(preorderConverter.convertToChaincode(preOrder))];
    //             sendRabbitMQ.send(config.PREORDERS_CHAINCODE, "update", args, function (err, result) {
    //                 logger.debug(loggerName, "confirmPreOrder blockchain executed with error if any " + util.inspect(err, {showHidden: false}));
    //                 if (err) {
    //                     res.status(400).json({
    //                         success: false,
    //                         result: err
    //                     });
    //                 }
    //                 else {
    //                     logger.debug(loggerName, "confirmPreOrder blockchain executed with " + util.inspect(result, {showHidden: false}));
    //                     if (result.success) {
    //                         //TODO: Response not sync
    //                         ocrController.processImage(req.token, preOrder._id, preOrder.json, function (err) {
    //                             if (err) {
    //                                 res.status(400).json({
    //                                     success: false,
    //                                     result: err
    //
    //                                 });
    //                             } else {
    //                                 notificationsController.createNotificationsByRole(req, 'warehouse_supervisor', 'order_warehousing',
    //                                     'New Packing List arrived', 'Packing List ' + preOrder.dispatch_no + ' arrived',
    //                                     function (err, result) {
    //                                         if (err) {
    //                                             logger.error(loggerName, err);
    //                                             res.status(400).json({
    //                                                 success: false,
    //                                                 result: err
    //                                             });
    //                                         } else {
    //                                             notificationsController.createNotificationsByRole(req, 'sales_manager', 'order_warehousing',
    //                                                 'Your Packing List arrived', 'Packing List ' + preOrder.dispatch_no + ' arrived', function (e, r) {
    //                                                     if (e) {
    //                                                         logger.error(loggerName, e);
    //                                                         res.status(400).json({
    //                                                             success: false,
    //                                                             result: e
    //                                                         });
    //                                                     } else {
    //                                                         res.status(200).json({
    //                                                             success: true,
    //                                                             result: preOrderId
    //                                                         });
    //                                                     }
    //                                                 });
    //
    //                                         }
    //                                     });
    //                             }
    //                         });
    //                     }
    //                     else {
    //                         res.status(400).json({
    //                             success: false,
    //                             result: result.result
    //
    //                         });
    //                     }
    //                 }
    //             });
    //         }
    //
    //     });
    // });

    let orders;
    let owner_company_id, owner_user_ids, manager_user_ids;
    let preOrderData;
    let total_net_weight = parseFloat(0.0);
    let total_gross_weight = parseFloat(0.0);
    let total_no_of_packages = 0;
    let total_volume = 0.0;
    async.series([
        function (mainCallback) {
            preOrdersModel.findById(preOrderId).populate('shipper').populate('ship_to').populate('company_id').exec(function (err, preorder) {
                if (err) {
                    logger.error(loggerName, err);
                    mainCallback(err);
                }
                owner_company_id = preorder['company_id'];
                owner_user_ids = preorder.client_user_ids;
                manager_user_ids = preorder.manager_user_ids;
                orders = JSON.parse(preorder.json).orders;
                preOrderData = preorder
                mainCallback();
            })
        },
        function (mainCallback) {
            async.forEach(orders, function (order, ordersCallBack) {
                let products = order.products;
                let lotIds = [];
                async.forEach(products, function (product, productsCallback) {
                    const lot = new lotsModel(product);
                    lot.save(function (err, savedLot) {
                        if (err) {
                            productsCallback(err);
                        }
                        else {
                            let args = [JSON.stringify(lotConverter.convertToChaincode(savedLot))];
                            sendRabbitMQ.send(config.LOTS_CHAINCODE, "create", args, function (err, result) {
                                if (err) {
                                    productsCallback(err);
                                } else {
                                    total_net_weight = total_net_weight + parseFloat(product.net_weight.replace(',', ''));
                                    total_gross_weight = total_gross_weight + parseFloat(product.gross_weight.replace(',', ''));
                                    total_no_of_packages = total_no_of_packages + parseInt(product.quantity);
                                    lotIds.push(savedLot._id);
                                    productsCallback(null);
                                }
                            });
                        }
                    });


                }, function (err) {
                    if (err) {
                        ordersCallBack(err);
                    }
                    else {
                        let warehouseOrder = {};
                        warehouseOrder["order_number"] = order.order_number;
                        warehouseOrder["po_no"] = order.customer_order_ref;
                        warehouseOrder["qty"] = order.quantity;
                        warehouseOrder["lots"] = lotIds;
                        warehouseOrder["preorder_id"] = preOrderId;
                        warehouseOrder['owner_company_id'] = owner_company_id._id;
                        warehouseOrder['owner_user_ids'] = owner_user_ids;
                        warehouseOrder['manager_user_ids'] = manager_user_ids;
                        let newWarehouseOrder = new orderWarehousesModel(warehouseOrder);
                        newWarehouseOrder.save(function (err, savedWarehouseOrder) {
                            if (err) {
                                ordersCallBack(err);
                            } else {
                                let args = [JSON.stringify(orderWarehousingConverter.convertToChaincode(savedWarehouseOrder))];
                                sendRabbitMQ.send(config.ORDER_WAREHOUSES_CHAINCODE, "create", args, function (err, result) {
                                    if (err) {
                                        ordersCallBack(err);
                                    }
                                    else {
                                        ordersCallBack();
                                    }
                                });
                            }
                        });
                    }
                })
            }, function (err) {
                if (err) {
                    mainCallback(err);
                }
                else {
                    mainCallback();
                }
            })
        },
        function (callback) {
            const shipper = preOrderData.shipper.name + "\n" +
                preOrderData.shipper.address.line1 + "," + preOrderData.shipper.address.line2 + "\n" +
                preOrderData.shipper.address.street + "\n" +
                preOrderData.shipper.address.city + "," + preOrderData.shipper.address.zip + "\n" +
                preOrderData.shipper.country;
            const ship_to = preOrderData.ship_to.name + "\n" +
                preOrderData.ship_to.address.line1 + "," + preOrderData.ship_to.address.line2 + "\n" +
                preOrderData.ship_to.address.street + "\n" +
                preOrderData.ship_to.address.city + "," + preOrderData.ship_to.address.zip + "\n" +
                preOrderData.ship_to.country;
            exceedController.processPackingList(shipper, ship_to, preOrderData.dispatch_no, new Date(), "driver_name", "vehicle_no", "container_no", "issued_by", total_net_weight, total_gross_weight, total_volume, total_no_of_packages, "good_condition",
                function (err, packinglistid) {
                    if (err) {
                        callback(err);
                    } else {
                        async.forEach(orders, function (order, ordersCallBack) {
                            let products = order.products;
                            async.forEach(products, function (product, productsCallback) {
                                let no = product.no;
                                let product_name = product.name;
                                let lot_number = product.lot_number;
                                let quantity = product.quantity;
                                let net_weight = product.net_weight;
                                let gross_weight = product.gross_weight;
                                productsModel.findById(product.product_id, function (err, productDetails) {
                                    if (err) {
                                        productsCallback(err);
                                    }
                                    else {
                                        exceedController.processPackingListItems(packinglistid, parseInt(no), productDetails.name, lot_number, parseInt(quantity), parseFloat(net_weight.replace(',', '')), parseFloat(gross_weight.replace(',', '')), productDetails.serial_number, function (err, result) {
                                            if (err) {
                                                productsCallback(err);
                                            } else {
                                                productsCallback();
                                            }
                                        });
                                    }
                                })

                            }, function (err) {
                                if (err) {
                                    ordersCallBack(err);
                                } else {
                                    ordersCallBack();
                                }

                            })
                        }, function (err) {
                            if (err) {
                                callback(err);
                            } else {
                                callback();
                            }
                        });
                    }
                });
        }
    ], function (err) {
        if (err) {
            res.status(400).json({
                success: false,
                result: err
            });
        }
        else {
            preOrdersModel.findById(preOrderId, function (err, preOrder) {
                if (err) {
                    res.status(400).json({
                        success: false,
                        result: err
                    });
                }

                preOrder.statuses.push({
                    type: 'Packing List Confirmed',
                    user_id: req.decoded._id
                });
                preOrder.markModified('statuses');
                preOrder.save(function (err) {
                    if (err) {
                        res.status(400).json({
                            success: false,
                            result: err
                        });
                    } else {
                        let args = [JSON.stringify(preorderConverter.convertToChaincode(preOrder))];
                        sendRabbitMQ.send(config.PREORDERS_CHAINCODE, "update", args, function (err, result) {
                            if (err) {
                                res.status(400).json({
                                    success: false,
                                    result: err
                                });
                            }
                            else {
                                global.eventEmitter.emit(global.sendBulkNotification,"order_confirmation",req.decoded._id,preOrderId,preOrderData.dispatch_no);
                                res.status(200).json(preOrder);
                            }
                        });
                    }
                });
            });
        }
    });
};


exports.confirmReceipt = function (req, res) {
    const dispatchno = String(req.params.dispatchno);
    logger.debug(loggerName, "confirmASN executed with " + util.inspect(req.params, {
        showHidden: false
    }));


    preOrdersModel.findOne({
        dispatch_no: dispatchno
    }, function (err, preOrder) {
        if (err) {
            logger.error(loggerName, err);
            res.status(400).json({
                success: false,
                result: err
            });
        }

        console.log(preOrder);
        console.log(preOrder.statuses);

        preOrder.statuses.push({
            type: 'FO scanned products',
            user_id: req.decoded._id
        });
        preOrder.statuses.push({
            type: 'Receipt Confirmation generated',
            user_id: req.decoded._id
        });
        preOrder.statuses.push({
            type: 'Stored',
            user_id: req.decoded._id
        });
        preOrder.markModified('statuses');
        preOrder.save(function (err) {
            if (err) {
                logger.error(loggerName, err);
                res.status(400).json({
                    success: false,
                    result: err
                });
            }
            else {
                let args = [JSON.stringify(preorderConverter.convertToChaincode(preOrder))];
                sendRabbitMQ.send(config.PREORDERS_CHAINCODE, "update", args, function (err, result) {
                    if (err) {
                        res.status(400).json({
                            success: false,
                            result: err
                        });
                    }
                    else {
                        if (!result.success) {
                            res.status(400).json({
                                success: false,
                                result: result.result

                            });
                        }
                    }
                });
            }
        }).then(() => {
            notificationsController.createNotificationsByRole(req, 'account_manager', 'order_warehousing',
                'Packing List stored', 'Packing List ' + dispatchno + ' is stored',
                function (err, result1) {
                    if (err) {
                        logger.error(loggerName, err);
                        res.status(400).json({
                            success: false,
                            result: err
                        });
                    } else {
                        notificationsController.createNotificationsByRole(req, 'account_manager', 'order_warehousing',
                            'Packing List stored', 'Packing List ' + dispatchno + ' is stored in Warehouse', function (err, result2) {
                                if (err) {
                                    logger.error(loggerName, err);
                                    res.status(400).json({
                                        success: false,
                                        result: err
                                    });
                                } else {
                                    notificationsController.createNotificationsByRole(req, 'sales_manager', 'order_warehousing',
                                        'Packing List stored', 'Packing List ' + dispatchno + ' is stored in Warehouse', function (err, result3) {
                                            if (err) {
                                                logger.error(loggerName, err);
                                                res.status(400).json({
                                                    success: false,
                                                    result: err
                                                });
                                            } else {
                                                res.status(200).json({
                                                    success: true,
                                                    result: dispatchno
                                                });
                                            }
                                        });
                                }
                            });

                    }
                });

        });
    });
};

exports.confirmASN = function (req, res) {
    const dispatchno = String(req.params.dispatchno);
    logger.debug(loggerName, "confirmASN executed with " + util.inspect(req.params, {
        showHidden: false
    }));


    preOrdersModel.findOne({
        dispatch_no: dispatchno
    }, function (err, preOrder) {
        if (err) {
            logger.error(loggerName, err);
            res.status(400).json({
                success: false,
                result: err
            });
        }
        preOrder.statuses.push({
            type: 'WS scanned products',
            user_id: req.decoded._id
        });
        preOrder.statuses.push({
            type: 'FO notified',
            user_id: req.decoded._id
        });
        preOrder.markModified('statuses');
        preOrder.save(function (err) {
            if (err) {
                logger.error(loggerName, err);
                res.status(400).json({
                    success: false,
                    result: err
                });
            }
            else {
                let args = [JSON.stringify(preorderConverter.convertToChaincode(preOrder))];
                sendRabbitMQ.send(config.PREORDERS_CHAINCODE, "update", args, function (err, result) {
                    if (err) {
                        res.status(400).json({
                            success: false,
                            result: err

                        });
                    }
                    else {
                        if (!result.success) {
                            res.status(400).json({
                                success: false,
                                result: result.result

                            });
                        }
                    }
                });
            }
        }).then(() => {
            notificationsController.createNotificationsByRole(req, 'fork_lift_operator', 'order_warehousing',
                'New Packing List arrived', 'Packing List ' + dispatchno + ' has arrived',
                function (err, result1) {
                    if (err) {
                        logger.error(loggerName, err);
                        res.status(200).json({
                            success: true,
                            result: dispatchno
                        });
                    } else {
                        notificationsController.createNotificationsByRole(req, 'account_manager', 'order_warehousing',
                            'We have received Packing List', 'ASN-' + dispatchno + '  received by Warehouse Supervisor',
                            function (err, result2) {
                                if (err) {
                                    logger.error(loggerName, err);
                                    res.status(200).json({
                                        success: true,
                                        result: dispatchno
                                    });
                                } else {
                                    notificationsController.createNotificationsByRole(req, 'sales_manager', 'order_warehousing',
                                        'We have received Packing List', 'ASN-' + dispatchno + '  received by Warehouse Supervisor',
                                        function (err, result3) {
                                            if (err) {
                                                logger.error(loggerName, err);
                                                res.status(200).json({
                                                    success: true,
                                                    result: dispatchno
                                                });
                                            } else {
                                                res.status(200).json({
                                                    success: true,
                                                    result: dispatchno
                                                });
                                            }
                                        });
                                }
                            });

                    }
                });

        });
    });
};

exports.deletePreorder = function (req, res) {
    preOrdersModel.findOneAndUpdate({
        _id: req.params.preorderId
    }, {
        deleted: true
    }, {
        new: true
    }, function (err, preorder) {
        if (err) {
            logger.error(loggerName, err);
            res.status(400).json({
                success: false,
                result: err
            });
        } else {
            res.status(200).json({
                success: true,
                result: {
                    message: 'preorder successfully deleted'
                }
            });
            logger.info(loggerName, 'Preorder Deleted');
        }
    });
};


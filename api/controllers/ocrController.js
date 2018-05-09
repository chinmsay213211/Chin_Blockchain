'use strict';

let config = require('config'),
    util = require('util'),
    mongoose = require('mongoose'),
    preOrdersModel = mongoose.model('preOrders'),
    lotsModel = mongoose.model('lots'),
    productsModel = mongoose.model('products'),
    exceedController = require("./exceedController"),
    lotConverter = require("../converters/lotsConverter"),
    orderWarehousingConverter = require("../converters/orderWarehousesConverter"),
    preOrdersConverter = require("../converters/preOrdersConverter"),
    sendRabbitMQ = require('../rabbitmq/sendRabbitMQ'),
    logger = require('../../logger'),
    notificationsController = require('./notificationsController'),
    orderWarehousesModel = mongoose.model('orderWarehouses'),
    request = require('request'),
    simulatorController = require('./simulatorController'),
    filesModel = mongoose.model('files');


const loggerName = "[OcrController]: ";


/**
 *
 * @param req.body.client_user_ids[]
 * @param req.body.company_id
 * @param req.body.manager_user_ids[]
 * @param req.body
 */
exports.validateImage = function (req, res) {
    logger.debug(loggerName, "validateImage executed with: " + util.inspect(req.body));

    const user_id = req.body.user_id;

    filesModel.findOne({user_id: user_id}, {}, {sort: {'_id': -1}}, function (err, files) {
        if (err) {
            logger.error(loggerName, err);
            res.status(400).json({
                success: false,
                result: err
            });
        } else {
            if (files === 'undefined' || files === null || files.file === 'undefined') {
                logger.error("Uploaded file not found for user " + user_id);
                res.status(400).json("File not found");
                return;
            }
            let options = {
                url: config.ocrURL,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                json: {
                    "str": files.file
                }
            };

            // Start the request
            logger.debug(loggerName, "ocrProcessor called");
            request(options, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    logger.debug(loggerName, "Sucessfully recieved response from OCR server");


                    productsModel.find({}, function (err, productsData) {
                        if (err) {
                            res.status(400).json({
                                success: false,
                                result: err
                            });
                        }
                        else {
                            let preOrdersData = new preOrdersModel(req.body);
                            preOrdersData.binary = files._id;
                            let orders = body.orders;
                            for (let i = 0; i < orders.length; i++) {
                                let products = orders[i].products;
                                for (let j = 0; j < products.length; j++) {
                                    orders[i].products[j].product_id = getProductID(products[j].name, productsData);
                                }
                            }
                            body.orders = orders;
                            //logger.debug(util.inspect(body, {showHidden: false, depth: null}));
                            preOrdersData.json = JSON.stringify(body);
                            preOrdersData.statuses.push({type: 'Packing List Accepted', user_id: req.decoded._id}); // 1

                            preOrdersData.save(function (err, savedPreOrders) {
                                if (err) {
                                    logger.error(loggerName, err);
                                    res.status(400).json({
                                        success: false,
                                        result: err
                                    });
                                } else {
                                    let args = [JSON.stringify(preOrdersConverter.convertToChaincode(savedPreOrders))];
                                    sendRabbitMQ.send(config.PREORDERS_CHAINCODE, "create", args, function (err, result) {
                                        console.log(result);
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
                                                    result: savedPreOrders._id
                                                });
                                            }
                                            else {
                                                res.status(400).json({
                                                    success: false,
                                                    result: result.result

                                                });
                                            }
                                        }
                                    });

                                }
                            });

                        }
                    });


                } else {
                    res.status(400).json({
                        success: false,
                        result: error
                    });
                }
            });
        }
    });
};

exports.processImage = function (token, preorderId, ocrJSON, callback) {
    logger.debug(loggerName, "processImage executed with id: " + preorderId);
    preOrdersModel.findById(preorderId, function (err, data) {
        if (err) {
            logger.error(loggerName, err);
            callback(err);
        }

        let owner_company_id = data['company_id'];
        let owner_user_ids = data.client_user_ids;
        let manager_user_ids = data.manager_user_ids;
        let orders = JSON.parse(ocrJSON).orders;
        saveProduct(token, owner_company_id, owner_user_ids, manager_user_ids, preorderId, orders, 0, callback);
    });
};

function saveProduct(token, owner_company_id, owner_user_ids, manager_user_ids, preOrderId, orders, order_index, callback) {
    logger.debug(loggerName, "saveProduct executed");
    if (orders.length > order_index) {
        //Save Products
        let products = orders[order_index].products;
        let order_number = orders[order_index].order_number;
        let ordersCount = orders.length;
        saveLotOneByOne(token, owner_company_id, owner_user_ids, manager_user_ids, preOrderId, products, 0, ordersCount, order_number, order_index, orders, callback);
    } else {
        exceedController.processPackingList("shipper", "ship_to", "dispatch_no", new Date(), "driver_name", "vehicle_no", "container_no", "issued_by", 1800.0, 1800.0, 1800.0, 7, "good_condition",
            function (err, result) {
                if (err) {
                    logger.error(loggerName, err);
                    callback(err);
                } else {
                    processOrders(orders, 0, preOrderId, result, callback);
                }
            });
    }

}

function processOrders(orders, i, preOrderId, result, callback) {
    if (orders.length > i) {
        let products = orders[i].products;
        processPackingList(orders, products, i, 0, preOrderId, result, callback);
    }
    else {
        processPreOrder(preOrderId, function (err) {
            if (err) {
                callback(err);
            } else {
                processReceipt(preOrderId, callback);
            }
        });
    }
}

function processPackingList(orders, products, i, j, preOrderId, result1, callback) {
    if (products.length > j) {
        logger.debug(loggerName, "{saveProduct}: product[j]: " + util.inspect(products[j], {
            showHidden: false
        }));
        let no = products[j].no;
        let product_name = products[j].name;
        let lot_number = products[j].lot_number;
        let quantity = products[j].quantity;
        let net_weight = products[j].net_weight;
        let gross_weight = products[j].gross_weight;
        logger.debug(loggerName, "{saveProduct}: processPackingListItems");
        exceedController.processPackingListItems(result1, parseInt(no), product_name, lot_number, parseInt(quantity), parseFloat(net_weight), parseFloat(gross_weight), function (err, result) {
            if (err) {
                callback(err);
            } else {
                processPackingList(orders, products, i, j + 1, preOrderId, result1, callback);
            }
        });
    }
    else {
        processOrders(orders, i + 1, preOrderId, result1, callback);
    }
}

let processPreOrder = function (preOrderId, callback) {
    logger.debug(loggerName, "processPreOrder executed with " + preOrderId);
    preOrdersModel.findById(preOrderId, function (err, result) {
        if (err) {
            callback(err);
            return;
        }
        let preorder_id1 = result._id;
        console.log(preorder_id1 + " test");
        orderWarehousesModel.find({preorder_id: preorder_id1})
            .populate('lots')
            .populate('owner_company_id')
            .populate('owner_user_ids')
            .populate('manager_user_ids')
            .exec(function (err, orderWarehouses) {
                if (err) {
                    callback(err);
                    return;
                }
                saveASN(result.dispatch_no, orderWarehouses, 0, callback);
            });
    });
};

function saveASN(dispatch_no, orderWarehouses, j, callback) {
    if (orderWarehouses.length > j) {
        let orderWarehouse = orderWarehouses[j];
        exceedController.generateASN(
            dispatch_no,
            orderWarehouse.owner_company_id.name,
            'Supplier',
            'NOT ASSIGNED CONTAINE 87951DXB',
            'Uknown',
            'ENOCREF',
            orderWarehouse.po_no,
            'BADSHA',
            10,
            'CUSTPONO',
            orderWarehouse.po_no,
            'NORMAL',
            orderWarehouse.manager_user_ids[0].first_name + " " + orderWarehouse.manager_user_ids[0].last_name,
            '-',
            'NONE',
            '0', function (err, asn_id) {
                if (err) {
                    callback(err);
                    return;
                }

                logger.debug(loggerName, "lots_length" + orderWarehouse.lots.length);
                saveASNItems(dispatch_no, asn_id, orderWarehouses, j, orderWarehouse, 0, callback);

            });
    }
    else {
        callback(null);
    }

}

function saveASNItems(dispatch_no, asn_id, orderWarehouses, j, orderWarehouse, i, callback) {
    if (orderWarehouse.lots.length > i) {
        lotsModel.findOne({_id: orderWarehouse.lots[i]._id}).populate('product_id').exec(
            function (err, lotWithData) {
                if (err) {
                    callback(err);
                    return;
                }

                logger.debug(loggerName, util.inspect(lotWithData, {showHidden: false}));

                exceedController.generateASNItems(
                    asn_id,
                    lotWithData.lot_number,
                    lotWithData.product_id.name,
                    'EA',
                    lotWithData.quantity,
                    '0',
                    '0',
                    '0',
                    '0',
                    '-',
                    '0',
                    '--',
                    '--',
                    '1.0000000',
                    '1.0000000',
                    '1.0000000',
                    '1.00000',
                    '0',
                    '0',
                    '1',
                    '36',
                    '-',
                    'Notes',
                    '-',
                    '-',
                    '-',
                    '-',
                    '-',
                    '-',
                    '-', '-', function (err, data) {
                        if (err) {
                            logger.debug(loggerName, err);
                            callback(err);
                        }
                        else {
                            saveASNItems(dispatch_no, asn_id, orderWarehouses, j, orderWarehouse, i + 1, callback);
                        }
                    });

            });
    }
    else {
        saveASN(dispatch_no, orderWarehouses, j + 1, callback);
    }
}


let processReceipt = function (preOrderId, callback) {
    preOrdersModel.findById(preOrderId, function (err, result) {
        if (err) {
            callback(err);
            return;
        }
        let preorder_id1 = result._id;
        orderWarehousesModel.find({preorder_id: preorder_id1})
            .populate('lots')
            .populate('owner_company_id')
            .populate('owner_user_ids')
            .populate('manager_user_ids')
            .exec(function (err, orderWarehouses) {
                if (err) {
                    logger.error(loggerName, err);
                    callback(err);
                } else {
                    saveReceipt(orderWarehouses, 0, result.dispatch_no, callback);
                }
            });
    });
};

function saveReceipt(orderWarehouses, j, dispatch_no, callback) {
    if (orderWarehouses.length > j) {
        let orderWarehouse = orderWarehouses[j];
        exceedController.generateReceiptConfirmation(orderWarehouse.po_no, orderWarehouse.po_no, "container_type",
            'warehouse_ref', orderWarehouse.owner_company_id.name, orderWarehouse.owner_company_id.name, 'ENOCREF', 0, "supplier_code", "supplier_name", "customer_po", "29/06/2017 15:52:45", "carrier_code", "carrier_name", "store_class", "29/06/2017 00:00:00", "29-Jun-2017 16:48:45", orderWarehouse.manager_user_ids[0].first_name + " " + orderWarehouse.manager_user_ids[0].last_name, "29-Jun-2017 14:30:18", dispatch_no,
            function (err, receipt_id) {
                if (err) {
                    callback(err);
                    return;
                }
                logger.debug(loggerName, "lots_length" + orderWarehouse.lots.length);
                saveReceiptItems(receipt_id, orderWarehouses, j, orderWarehouse, 0, dispatch_no, callback);

            });
    }
    else {
        logger.debug(loggerName, "saveReceipt completed");
        callback(null);
    }

}

function saveReceiptItems(receipt_id, orderWarehouses, j, orderWarehouse, i, dispatch_no, callback) {
    if (orderWarehouse.lots.length > i) {
        lotsModel.findOne({_id: orderWarehouse.lots[i]._id}).populate('product_id').exec(
            function (err, lotWithData) {
                if (err) {
                    callback(err);
                    return;
                }

                logger.debug(loggerName, util.inspect(lotWithData, {showHidden: false}));

                exceedController.generateReceiptConfirmationItems(
                    receipt_id,
                    lotWithData.lot_number,
                    lotWithData.product_id.name, 4, 4, 0, 0, "28/10/2021", 1, "batch_no", "uom", "status", "cbm", function (err, data) {
                        if (err) {
                            callback(err);
                            return;
                        }
                        else {
                            saveReceiptItems(receipt_id, orderWarehouses, j, orderWarehouse, i + 1, dispatch_no, callback);
                        }
                    });

            });
    }
    else {
        saveReceipt(orderWarehouses, j + 1, dispatch_no, callback);
    }
}

function saveProductOneByOne(token, owner_company_id, owner_user_ids, manager_user_ids, preorderId, products, index, ordersCount, order_number, order_index, orders, callback) {
    logger.debug(loggerName, "saveProductOneByOne executed");
    if (products.length > (index)) {
        //Saving the Product
        let data = products[index];
        let options = {
            url: 'http://' + config.host + ':' + config.port + '/api/v1/products',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': token
            },
            json: data
        };

        // Start the request
        request(options, function (error, response, savedProduct) {
            savedProduct = savedProduct.result;
            if (!error && response.statusCode === 200) {
                products[index].product_id = savedProduct._id;
                saveLotOneByOne(token, owner_company_id, owner_user_ids, manager_user_ids, preorderId, products, index, ordersCount, order_number, order_index, orders, callback);
            } else {
                logger.error(loggerName, "{saveProductOneByOne}: " + error);
                callback(error);
            }
        });
    } else {
        logger.debug(loggerName, "{saveProductOneByOne}: Inside orders");
        let lotIds = [];
        for (let i = 0; i < products.length; i++) {
            lotIds[i] = products[i].lot_id;
        }
        let order = {};
        logger.debug(loggerName + "DATA: ", orders[order_index]);
        logger.debug(loggerName + "QUANTITY: ", orders[order_index].quantity);
        order["order_number"] = order_number;
        order["po_no"] = orders[order_index].customer_order_ref;
        order["qty"] = orders[order_index].quantity;
        order["lots"] = lotIds;
        order["preorder_id"] = preorderId;
        order['owner_company_id'] = owner_company_id;
        order['owner_user_ids'] = owner_user_ids;
        order['manager_user_ids'] = manager_user_ids;

        //Save the Order finally
        saveOrderOneByOne(token, owner_company_id, owner_user_ids, manager_user_ids, preorderId, order, order_index, orders, callback);
    }
}

function saveOrderOneByOne(token, owner_company_id, owner_user_ids, manager_user_ids, preorderId, order, order_index, orders, callback) {
    //Saving the Order
    let data = order;
    let newOrderWarehousing = new orderWarehousesModel(data);

    newOrderWarehousing.save(function (err, savedOrderWarehousing) {
        if (err) {
            callback(err);
        }
        else {
            let args = [JSON.stringify(orderWarehousingConverter.convertToChaincode(savedOrderWarehousing))];
            sendRabbitMQ.send(config.ORDER_WAREHOUSES_CHAINCODE, "create", args, function (err, result) {
                if (err) {
                    callback(err);
                }
                else {
                    if (result.success) {
                        saveProduct(token, owner_company_id, owner_user_ids, manager_user_ids, preorderId, orders, order_index + 1, callback);
                    } else {
                        callback(result.result);
                    }
                }
            });

        }
    });
    // let options = {
    //     url: 'http://' + config.host + ':' + config.port + '/api/v1/order_warehousings',
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'x-access-token': token
    //     },
    //     json: data
    // };
    // // Start the request
    // request(options, function (error, response, savedOrder) {
    //     if (!error && response.statusCode === 200) {
    //         saveProduct(token, owner_company_id, owner_user_ids, manager_user_ids, preorderId, orders, order_index + 1, callback);
    //     } else {
    //         logger.error(loggerName, "{saveOrderOneByOne}: ", error);
    //         callback(error);
    //     }
    // });
}

function saveLotOneByOne(token, owner_company_id, owner_user_ids, manager_user_ids, preorderId, products, index, ordersCount, order_number, order_index, orders, callback) {
    //Saving the Lot
    if (products.length > (index)) {
        let data = products[index];
        let newLot = new lotsModel(data);
        newLot.save(function (err, savedLot) {
            if (err) {
                callback(err);
            }
            else {
                let args = [JSON.stringify(lotConverter.convertToChaincode(savedLot))];
                sendRabbitMQ.send(config.LOTS_CHAINCODE, "create", args, function (err, result) {
                    if (err) {
                        callback(err);
                    } else {
                        if (result.success) {
                            if (products.length > (index)) {
                                products[index].lot_id = savedLot._id;
                                // Save the next Product
                                saveLotOneByOne(token, owner_company_id, owner_user_ids, manager_user_ids, preorderId, products, index + 1, ordersCount, order_number, order_index, orders, callback);
                            }
                        } else {
                            callback(result.result);
                        }
                    }
                });

            }
        });
    } else {
        logger.debug(loggerName, "{saveProductOneByOne}: Inside orders");
        let lotIds = [];
        for (let i = 0; i < products.length; i++) {
            lotIds[i] = products[i].lot_id;
        }
        let order = {};

        logger.debug(loggerName + "DATA: ", orders[order_index]);
        logger.debug(loggerName + "QUANTITY: ", orders[order_index].quantity);


        order["order_number"] = order_number;
        order["po_no"] = orders[order_index].customer_order_ref;
        order["qty"] = orders[order_index].quantity;
        order["lots"] = lotIds;
        order["preorder_id"] = preorderId;
        order['owner_company_id'] = owner_company_id;
        order['owner_user_ids'] = owner_user_ids;
        order['manager_user_ids'] = manager_user_ids;

        //Save the Order finally
        saveOrderOneByOne(token, owner_company_id, owner_user_ids, manager_user_ids, preorderId, order, order_index, orders, callback);
    }
    // let options = {
    //     url: 'http://' + config.host + ':' + config.port + '/api/v1/lots',
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'x-access-token': token,
    //     },
    //     json: data
    // };
    // // Start the request
    // request(options, function (error, response, savedLot) {
    //     savedLot = savedLot.result;
    //     if (!error && response.statusCode === 200) {
    //         if (products.length > (index)) {
    //             products[index].lot_id = savedLot._id;
    //             // Save the next Product
    //
    //             saveProductOneByOne(token, owner_company_id, owner_user_ids, manager_user_ids, preorderId, products, index + 1, ordersCount, order_number, order_index, orders, callback);
    //         }
    //     } else {
    //         logger.error(loggerName, "{saveLotOneByOne}: error: " + error);
    //         callback(error);
    //     }
    // });
}

function getDistance(s1, s2) {
    let a = s1.replace(/ /g, '').toLowerCase();
    let b = s2.replace(/ /g, '').toLowerCase();
    let costs = [];
    for (let j = 0; j < b.length + 1; j++) {
        costs[j] = j;
    }
    for (let i = 1; i <= a.length; i++) {
        costs[0] = i;
        let nw = i - 1;
        for (let j = 1; j <= b.length; j++) {
            let cj = Math.min(1 + Math.min(costs[j], costs[j - 1]),
                a.charAt(i - 1) == b.charAt(j - 1) ? nw : nw + 1);
            nw = costs[j];
            costs[j] = cj;
        }
    }
    return costs[b.length];
};

function getProductID(name, productsData) {
    let distances = [];
    for (let i = 0; i < productsData.length; i++) {
        let distance = getDistance(productsData[i].serial_number + "-" + productsData[i].name, name);
        distances.push(distance);
    }
    distances.sort(function (a, b) {
        return a - b;
    });

    for (let i = 0; i < productsData.length; i++) {
        let distance = getDistance(productsData[i].serial_number + "-" + productsData[i].name, name);
        if (distance === distances[0]) {
            return productsData[i]._id;
        }
    }

};

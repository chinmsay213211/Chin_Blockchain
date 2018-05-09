'use strict';

const request = require('request'),
    config = require('config'),
    util = require('util'),
    async = require('async'),
    logger = require('./logger'),
    sleep = require('sleep'),
    sendRabbitMQ = require('./api/rabbitmq/sendRabbitMQ');

let companies = [],
    users = [],
    truck_makes = [],
    truck_models = [],
    trucks = [],
    storages = [],
    products = [],
    lots = [],
    preOrders = [],
    orderWarehouses = [];

const companiesModel = require('./api/models/companiesModel'),
    usersModel = require('./api/models/usersModel'),
    truckMakesModel = require('./api/models/truckMakesModel'),
    truckModelsModel = require('./api/models/truckModelsModel'),
    trucksModel = require('./api/models/trucksModel'),
    storagesModel = require('./api/models/storagesModel'),
    productsModel = require('./api/models/productsModel'),
    lotsModel = require('./api/models/lotsModel'),
    locationsModel = require('./api/models/locationsModel'),
    preOrdersModel = require('./api/models/preOrdersModel'),
    orderWarehousesModel = require('./api/models/orderWarehousesModel');

const companiesConverter = require('./api/converters/companiesConverter'),
    usersConverter = require('./api/converters/usersConverter'),
    truckMakesConverter = require('./api/converters/truckMakesConverter'),
    truckModelsConverter = require('./api/converters/truckModelsConverter'),
    trucksConverter = require('./api/converters/trucksConverter'),
    storagesConverter = require('./api/converters/storagesConverter'),
    productsConverter = require('./api/converters/productsConverter'),
    lotsConverter = require('./api/converters/lotsConverter'),
    preOrdersConverter = require('./api/converters/preOrdersConverter'),
    orderWarehousesConverter = require('./api/converters/orderWarehousesConverter');

let mongoose = require('mongoose');
mongoose.Promise = global.Promise;

let con = mongoose.connect(config.db);

const loggerName = "[DummyLoad]: ";

function save_(objArr, obj, objConverter, chaincodeName, callback) {
    obj.save(function (err, savedObj) {
        if (err) {
            logger.error(loggerName, "Error in save: \n" + err);
            callback(err);
        } else {
            sendRabbitMQ.send(chaincodeName, "create", [JSON.stringify(objConverter.convertToChaincode(obj))], function (err, result) {
                if (result.success === true) {
                    objArr.push(savedObj);
                    callback(null, savedObj);
                } else {
                    logger.error(loggerName, "Error in result.result: \n" + util.inspect(result, {
                        showHidden: false,
                        depth: null
                    }));
                    callback(result.result);
                }
            });
        }
    });
}

mongoose.connection.on('open', function (err) {
    if (err) {
        throw err;
    } else {
        con.connection.db.dropDatabase(function (err) {
            if (err) {
                throw err;
            } else {
                async.series(
                    [
                        function (callback) {
                            save_(companies, new companiesModel({
                                name: "ENOC",
                                email: "enoc@gmail.com",
                                phone_number: "+77078246709"
                            }), companiesConverter, 'companies_chaincode', callback);
                        },
                        function (callback) {
                            save_(companies, new companiesModel({
                                name: "Tristar",
                                email: "tristar@gmail.com",
                                phone_number: "+7707855555"
                            }), companiesConverter, 'companies_chaincode', callback);
                        },
                        function (callback) {
                            save_(users, new usersModel({
                                first_name: "Kanat",
                                last_name: "Tulbassiyev",
                                email: "kanat@blockgemini.com",
                                phone_number: "+77078246709",
                                role: "account_manager",
                                company_id: companies[1]._id,
                                invitation_code: "invitation_code_am"
                            }), usersConverter, 'users_chaincode', callback);
                        },
                        // function (callback) {
                        //     save_(users, new usersModel({
                        //         first_name: "Chinmay",
                        //         last_name: "Sahoo",
                        //         email: "chinmay@blockgemini.com",
                        //         phone_number: "+770712346709",
                        //         role: "fork_lift_operator",
                        //         company_id: companies[1]._id,
                        //         invitation_code: "invitation_code_fo"
                        //     }), usersConverter, 'users_chaincode', callback);
                        // },
                        // function (callback) {
                        //     save_(users, new usersModel({
                        //         first_name: "Bayden",
                        //         last_name: "Austin",
                        //         email: "bayden@blockgemini.com",
                        //         phone_number: "+77078211111",
                        //         role: "admin",
                        //         company_id: companies[1]._id,
                        //         invitation_code: "invitation_code_admin"
                        //     }), usersConverter, 'users_chaincode', callback);
                        // },
                        // function (callback) {
                        //     save_(users, new usersModel({
                        //         first_name: "Ravi",
                        //         last_name: "Prasad",
                        //         email: "ravi@blockgemini.com",
                        //         phone_number: "+77078243231",
                        //         role: "warehouse_supervisor",
                        //         company_id: companies[1]._id,
                        //         invitation_code: "invitation_code_ws"
                        //     }), usersConverter, 'users_chaincode', callback);
                        // },
                        // function (callback) {
                        //     save_(users, new usersModel({
                        //         first_name: "Kunjan",
                        //         last_name: "Shah",
                        //         email: "kunjan@blockgemini.com",
                        //         phone_number: "+77078246727",
                        //         role: "driver",
                        //         company_id: companies[1]._id,
                        //         invitation_code: "invitation_code_driver"
                        //     }), usersConverter, 'users_chaincode', callback);
                        // },
                        // function (callback) {
                        //     save_(users, new usersModel({
                        //         first_name: "Sergey",
                        //         last_name: "Petkevich",
                        //         email: "sergey@blockgemini.com",
                        //         phone_number: "+77078878787",
                        //         role: "sales_manager",
                        //         company_id: companies[0]._id,
                        //         invitation_code: "invitation_code_sm"
                        //     }), usersConverter, 'users_chaincode', callback);
                        // },
                        // // trucks_makes
                        // function (callback) {
                        //     save_(truck_makes, new truckMakesModel({
                        //         name: "Toyota"
                        //     }), truckMakesConverter, 'truck_makes_chaincode', callback);
                        // },
                        // function (callback) {
                        //     save_(truck_makes, new truckMakesModel({
                        //         name: "Mercedes"
                        //     }), truckMakesConverter, 'truck_makes_chaincode', callback);
                        // },
                        // // truck_models
                        // function (callback) {
                        //     save_(truck_models, new truckModelsModel({
                        //         truck_makes_id: truck_makes[0]._id,
                        //         name: "Camry",
                        //     }), truckModelsConverter, 'truck_models_chaincode', callback);
                        // },
                        // function (callback) {
                        //     save_(truck_models, new truckModelsModel({
                        //         truck_makes_id: truck_makes[1]._id,
                        //         name: "S600",
                        //     }), truckModelsConverter, 'truck_models_chaincode', callback);
                        // },
                        // function (callback) {
                        //     save_(truck_models, new truckModelsModel({
                        //         truck_makes_id: truck_makes[0]._id,
                        //         name: "Corolla",
                        //     }), truckModelsConverter, 'truck_models_chaincode', callback);
                        // },
                        // // trucks
                        // function (callback) {
                        //     save_(trucks, new trucksModel({
                        //         truck_makes_id: truck_makes[0]._id,
                        //         truck_models_id: truck_models[0]._id,
                        //         number: "111111",
                        //         plate_number: "111111"
                        //     }), trucksConverter, 'trucks_chaincode', callback);
                        // },
                        // function (callback) {
                        //     save_(trucks, new trucksModel({
                        //         truck_makes_id: truck_makes[1]._id,
                        //         truck_models_id: truck_models[1]._id,
                        //         number: "22222",
                        //         plate_number: "22222"
                        //     }), trucksConverter, 'trucks_chaincode', callback);
                        // },
                        // // storages
                        // function (callback) {
                        //     save_(storages, new storagesModel({
                        //         pallet_id: 1,
                        //         rack_id: 1,
                        //         location: {
                        //             latitude: "1.0",
                        //             longtitude: "1.0"
                        //         },
                        //         storage_rating: "B"
                        //     }), storagesConverter, 'storages_chaincode', callback);
                        // },
                        // function (callback) {
                        //     save_(storages, new storagesModel({
                        //         pallet_id: 1,
                        //         rack_id: 12,
                        //         location: {
                        //             latitude: "1.0",
                        //             longtitude: "2.0"
                        //         },
                        //         storage_rating: "B"
                        //     }), storagesConverter, 'storages_chaincode', callback);
                        // },
                        // function (callback) {
                        //     save_(storages, new storagesModel({
                        //         pallet_id: 1,
                        //         rack_id: 1,
                        //         location: {
                        //             latitude: "2.0",
                        //             longtitude: "1.0"
                        //         },
                        //         storage_rating: "A"
                        //     }), storagesConverter, 'storages_chaincode', callback);
                        // },
                        // function (callback) {
                        //     save_(storages, new storagesModel({
                        //         pallet_id: 1,
                        //         rack_id: 1,
                        //         location: {
                        //             latitude: "2.0",
                        //             longtitude: "2.0"
                        //         },
                        //         storage_rating: "A"
                        //     }), storagesConverter, 'storages_chaincode', callback);
                        // },
                        // function (callback) {
                        //     if (config.ENV === 'PRODUCTION') {
                        //         callback();
                        //     } else {
                        //         save_(products, new productsModel({
                        //             name: 'Product#1',
                        //             net_weight: 10.100,
                        //             gross_weight: 10.111
                        //         }), storagesConverter, 'products_chaincode', callback);
                        //     }
                        // },
                        // function (callback) {
                        //     if (config.ENV === 'PRODUCTION') {
                        //         callback();
                        //     } else {
                        //         save_(products, new productsModel({
                        //             name: 'Product#2',
                        //             net_weight: 20.100,
                        //             gross_weight: 20.111
                        //         }), storagesConverter, 'products_chaincode', callback);
                        //     }
                        // },
                        // function (callback) {
                        //     if (config.ENV === 'PRODUCTION') {
                        //         callback();
                        //     } else {
                        //         save_(lots, new lotsModel({
                        //             product_id: products[0]._id,
                        //             owner_company_id: companies[0]._id,
                        //             owner_user_ids: [users[5]._id],
                        //             manager_user_ids: [users[0]._id],
                        //             lot_number: 'Lot$1',
                        //             quantity: 20,
                        //             net_weight: 202.1,
                        //             gross_weight: 87.1,
                        //             batch_number: 'Batch#1'
                        //         }), lotsConverter, 'lots_chaincode', callback);
                        //     }
                        // },
                        // function (callback) {
                        //     if (config.ENV === 'PRODUCTION') {
                        //         callback();
                        //     } else {
                        //         save_(lots, new lotsModel({
                        //             product_id: products[1]._id,
                        //             owner_company_id: companies[0]._id,
                        //             owner_user_ids: [users[5]._id],
                        //             manager_user_ids: [users[0]._id],
                        //             lot_number: 'Lot$1',
                        //             quantity: 20,
                        //             net_weight: 102.1,
                        //             gross_weight: 23.1,
                        //             batch_number: 'Batch#2'
                        //         }), lotsConverter, 'lots_chaincode', callback);
                        //     }
                        // },
                        // function (callback) {
                        //     if (config.ENV === 'PRODUCTION') {
                        //         callback();
                        //     } else {
                        //         save_(preOrders, new preOrdersModel({
                        //             shipper: 'ENOC LLC',
                        //             ship_to: 'Tristar ENOPPC',
                        //             dispatch_no: '53112345',
                        //             client_user_ids: [users[5]._id],
                        //             company_id: companies[0]._id,
                        //             manager_user_ids: [users[0]._id],
                        //             preorder_type: 'warehousing',
                        //             binary: '-',
                        //             json: '-',
                        //             statuses: [
                        //                 {
                        //                     user_id: users[0]._id,
                        //                     type: 'Packing List Accepted'
                        //                 }
                        //             ]
                        //
                        //         }), preOrdersConverter, 'preorders_chaincode', callback);
                        //     }
                        // },
                        // function (callback) {
                        //     if (config.ENV === 'PRODUCTION') {
                        //         callback();
                        //     } else {
                        //         save_(orderWarehouses, new orderWarehousesModel({
                        //             owner_company_id: companies[0]._id,
                        //             owner_user_ids: [users[5]._id],
                        //             manager_user_ids: [users[0]._id],
                        //             preorder_id: preOrders[0]._id,
                        //             order_number: '4213244',
                        //             order_status: 'processed',
                        //             lots: [lots[0]._id, lots[1]._id],
                        //             po_no: 'PO.NO 431',
                        //             dispatch_no: '53112345',
                        //             qty: "11"
                        //         }), orderWarehousesConverter, 'order_warehouses_chaincode', callback);
                        //     }
                        // },
                    ],

                    function (err, results) {
                        mongoose.connection.close();
                        if (err) {
                            throw err;
                        } else {
                            for (let i = 0; i < results.length; i++) {
                                console.log(results[i]);
                            }
                        }
                    }
                );
            }
        });
    }
});

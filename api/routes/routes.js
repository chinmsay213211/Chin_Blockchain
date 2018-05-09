'use strict';

module.exports = function (app) {
    let usersController = require('../controllers/usersController'),
        companiesController = require('../controllers/companiesController'),
        commoditiesController = require('../controllers/commoditiesController'),
        locationsController = require('../controllers/locationsController'),
        sessionsController = require('../controllers/sessionsController'),
        activitiesController = require('../controllers/activitiesController'),
        preOrdersController = require('../controllers/preOrdersController'),
        trucksController = require('../controllers/trucksController'),
        truckMakesController = require('../controllers/truckMakesController'),
        deliveryVouchersController = require('../controllers/deliveryVouchersController'),
        lotsController = require('../controllers/lotsController'),
        productsController = require('../controllers/productsController'),
        warehousesController = require('../controllers/warehousesController'),
        transportationsController = require('../controllers/transportationsController'),
        actionsController = require('../controllers/actionsController'),
        storagesController = require('../controllers/storagesController'),
        pickListsController = require('../controllers/pickListsController'),
        transportationLogsController = require('../controllers/transportationLogsController'),
        orderWarehousesController = require('../controllers/orderWarehousesController'),
        truckModelsController = require('../controllers/truckModelsController'),
        orderTransportationsController = require('../controllers/orderTransportationsController'),
        authController = require('../controllers/authController'),
        ocrController = require('../controllers/ocrController'),
        ansController = require('../controllers/asnController'),
        receiptController = require('../controllers/receiptconfirmationController'),
        explorerController = require('../controllers/explorerController'),
        explorerLogController = require('../controllers/explorerLogController'),
        notificationsController = require('../controllers/notificationsController');

    app.route('/api/v1/explorer')
        .get(explorerController.explorer);

    app.route('/api/v1/explorerlogs/:blockheight')
        .get(explorerLogController.explorerlogs);

    app.route('/api/v1/ocr/validateImage')
        .post(ocrController.validateImage);

    // authorization
    app.route('/api/v1/auth')
        .post(authController.auth);

    app.route('/api/v1/sign')
        .post(authController.verifySignature);

    //user routes
    app.route('/api/v1/users')
        .get(usersController.getUsers)
        .post(usersController.createUser);

    app.route('/api/v1/users/:companyId')
        .get(usersController.getCompanyUsers);

    app.route('/api/v1/user/:userId')
        .get(usersController.getUser)
        .post(usersController.updateUser)
        .delete(usersController.deleteUser);

    // company routes
    app.route('/api/v1/companies')
        .get(companiesController.getCompanies)
        .post(companiesController.createCompany);

    app.route('/api/v1/company/:companyId')
        .get(companiesController.getCompany)
        .post(companiesController.updateCompany)
        .delete(companiesController.deleteCompany);

    // commodity routes
    app.route('/api/v1/commodities')
        .get(commoditiesController.getCommodities)
        .post(commoditiesController.createCommodity);

    app.route('/api/v1/commodity/:companyId')
        .get(commoditiesController.getCommodity)
        .post(commoditiesController.updateCommodity)
        .delete(commoditiesController.deleteCommodity);

    // location routes
    app.route('/api/v1/locations')
        .get(locationsController.getLocations)
        .post(locationsController.createLocation);

    app.route('/api/v1/location/:locationId')
        .get(locationsController.getLocation)
        .post(locationsController.updateLocation)
        .delete(locationsController.deleteLocation);

    // session routes
    app.route('/api/v1/sessions')
        .get(sessionsController.getSessions)
        .post(sessionsController.createSession);

    app.route('/api/v1/session/:sessionId')
        .get(sessionsController.getSession)
        .post(sessionsController.updateSession)
        .delete(sessionsController.deleteSession);

    // activity routes
    app.route('/api/v1/activities')
        .get(activitiesController.getActivities)
        .post(activitiesController.createActivity);

    app.route('/api/v1/activity/:activityId')
        .get(activitiesController.getActivity)
        .post(activitiesController.updateActivity)
        .delete(activitiesController.deleteActivity);

    // preorder routes
    app.route('/api/v1/preorders')
        .get(preOrdersController.getPreorders);

    app.route('/api/v1/preorders_')
        .get(preOrdersController.getSmallPreorders);

    app.route('/api/v1/preorder/:preorderId')
        .get(preOrdersController.getPreorder)
        .post(preOrdersController.confirmPreOrder)
        .delete(preOrdersController.deletePreorder);

    app.route('/api/v1/updatePreorder/:preorderId')
        .post(preOrdersController.updatePreorder);

    app.route('/api/v1/asn/:dispatchno')
        .post(preOrdersController.confirmASN);

    app.route('/api/v1/receipt/:dispatchno')
        .post(preOrdersController.confirmReceipt);

    // truck routes
    app.route('/api/v1/trucks')
        .get(trucksController.getTrucks)
        .post(trucksController.createTruck);

    // truck routes
    app.route('/api/v1/gettrucks_models_makes')
        .get(trucksController.getAll_Trucks_Models_Makes);

    app.route('/api/v1/truck/:truckId')
        .get(trucksController.getTruck)
        .post(trucksController.updateTruck)
        .delete(trucksController.deleteTruck);

    // truck_make routes
    app.route('/api/v1/truck_makes')
        .get(truckMakesController.getTruck_makes)
        .post(truckMakesController.createTruck_make);

    app.route('/api/v1/truck_make/:truck_makeId')
        .get(truckMakesController.getTruck_make)
        .post(truckMakesController.updateTruck_make)
        .delete(truckMakesController.deleteTruck_make);

    // delivery_voucher routes
    app.route('/api/v1/delivery_vouchers')
        .get(deliveryVouchersController.getDelivery_vouchers)
        .post(deliveryVouchersController.createDelivery_voucher);

    app.route('/api/v1/delivery_voucher/:delivery_voucherId')
        .get(deliveryVouchersController.getDelivery_voucher)
        .post(deliveryVouchersController.updateDelivery_voucher)
        .delete(deliveryVouchersController.deleteDelivery_voucher);

    // lot routes
    app.route('/api/v1/lots')
        .get(lotsController.getLots)
        .post(lotsController.createLot);

    app.route('/api/v1/lot/:lotId')
        .get(lotsController.getLot)
        .post(lotsController.updateLot)
        .delete(lotsController.deleteLot);

    // product routes
    app.route('/api/v1/products')
        .get(productsController.getProducts)
        .post(productsController.createProduct);

    app.route('/api/v1/product/:productId')
        .get(productsController.getProduct)
        .post(productsController.updateProduct)
        .delete(productsController.deleteProduct);

    // warehouse routes
    app.route('/api/v1/warehouses')
        .get(warehousesController.getWarehouses)
        .post(warehousesController.createWarehouse);

    app.route('/api/v1/warehouse/:warehouseId')
        .get(warehousesController.getWarehouse)
        .post(warehousesController.updateWarehouse)
        .delete(warehousesController.deleteWarehouse);

    // transportation routes
    app.route('/api/v1/transportations')
        .get(transportationsController.getTransportations)
        .post(transportationsController.createTransportation);

    app.route('/api/v1/transportation/:transportationId')
        .get(transportationsController.getTransportation)
        .post(transportationsController.updateTransportation)
        .delete(transportationsController.deleteTransportation);

    // action routes
    app.route('/api/v1/actions')
        .get(actionsController.getActions)
        .post(actionsController.createAction);

    app.route('/api/v1/action/:actionId')
        .get(actionsController.getAction)
        .post(actionsController.updateAction)
        .delete(actionsController.deleteAction);

    // storage routes
    app.route('/api/v1/storages')
        .get(storagesController.getStorages)
        .post(storagesController.createStorage);

    app.route('/api/v1/storage/:storageId')
        .get(storagesController.getStorage)
        .post(storagesController.updateStorage)
        .delete(storagesController.deleteStorage);

    //pick_list routes
    app.route('/api/v1/pick_lists')
        .get(pickListsController.getPick_lists)
        .post(pickListsController.createPick_list);

    app.route('/api/v1/pick_list/:pick_listId')
        .get(pickListsController.getPick_list)
        .post(pickListsController.updatePick_list)
        .delete(pickListsController.deletePick_list);

    // transportation_log routes
    app.route('/api/v1/transportation_logs')
        .get(transportationLogsController.getTransportation_logs)
        .post(transportationLogsController.createTransportation_log);

    app.route('/api/v1/transportation_log/:transportation_logId')
        .get(transportationLogsController.getTransportation_log)
        .post(transportationLogsController.updateTransportation_log)
        .delete(transportationLogsController.deleteTransportation_log);

    // order_warehousing routes
    app.route('/api/v1/order_warehousings')
        .get(orderWarehousesController.getOrder_warehousings)
        .post(orderWarehousesController.createOrder_warehousing);

    app.route('/api/v1/order_warehousings_by_pi/:preorder_id')
        .get(orderWarehousesController.getOrderWarehousesByPreOrderId);

    app.route('/api/v1/order_warehousing/:order_warehousingId')
        .get(orderWarehousesController.getOrder_warehousing)
        .post(orderWarehousesController.updateOrder_warehousing)
        .delete(orderWarehousesController.deleteOrder_warehousing);

    // truck_model routes
    app.route('/api/v1/truck_models')
        .get(truckModelsController.getTruck_models)
        .post(truckModelsController.createTruck_model);

    app.route('/api/v1/truck_model/:truck_modelId')
        .get(truckModelsController.getTruck_model)
        .post(truckModelsController.updateTruck_model)
        .delete(truckModelsController.deleteTruck_model);

    // order_transportation routes
    app.route('/api/v1/order_transportations')
        .get(orderTransportationsController.getOrder_transportations)
        .post(orderTransportationsController.createOrder_transportation);

    app.route('/api/v1/order_transportation/:order_transportationId')
        .get(orderTransportationsController.getOrder_transportation)
        .post(orderTransportationsController.updateOrder_transportation)
        .delete(orderTransportationsController.deleteOrder_transportation);

    // Get ANS
    app.route('/api/v1/getasn')
        .get(ansController.getASNs);

    app.route('/api/v1/getasn/:dispatch_no')
        .get(ansController.getASN);

    // Get Receipt Confirmation
    app.route('/api/v1/getreceipts')
        .get(receiptController.getReceipts);

    app.route('/api/v1/getreceipt/:dispatch_no')
        .get(receiptController.getReceipt);

    // Get notifications
    app.route('/api/v1/notifications')
        .get(notificationsController.getNotifications)
        .post(notificationsController.createNotification);

    app.route('/api/v1/notification/:notificationId')
        .get(notificationsController.getNotification)
        .delete(notificationsController.deleteNotification);

    app.route('/api/v1/notifications_count')
        .get(notificationsController.getNotificationsCount);

};

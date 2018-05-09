const mongoose = require('mongoose'),
    preOrdersModel = mongoose.model('preOrders'),
    userModel = mongoose.model('users'),
    notificationsModel = mongoose.model('notifications'),
    async = require('async');

//Notifications
global.sendBulkNotification = 'sendBulkNotifications';
global.sendNotification = 'sendNotification';

exports.sendBulkNotification = function (type, requester_userId, preorderId, notification_attachment_id) {
    let notifications = [];
    preOrdersModel.findById(preorderId).populate('client_user_ids').populate('manager_user_ids').populate('company_id').exec(function (err, preorder) {
        if (err) {
            //TODO: Send Notification system error to System Admin
        }
        else {
            const client_user_ids = preorder.client_user_ids;
            const manager_user_ids = preorder.manager_user_ids;
            let salesManagers = [];
            let currentUser;
            async.series([
                function (callback) {
                    userModel.find({role: "sales_manager"}, function (err, users) {
                        if (err) {
                            callback(err);
                        } else {
                            salesManagers = users;
                            callback();
                        }
                    });
                },
                function (callback) {
                        userModel.findById(requester_userId, function (err, user) {
                            if (err) {
                                callback(err);
                            } else {
                                currentUser = user;
                                callback();
                            }
                        });
                }
            ], function (err) {
                if (err) {

                } else {
                    salesManagers.forEach(function (salesManager) {
                        manager_user_ids.push(salesManager)
                    });
                    manager_user_ids.forEach(function (userdata) {
                        if (!userdata._id.equals(currentUser._id))
                        {
                            switch (type) {
                                case "order_confirmation":
                                    sendConfirmationNotification(userdata._id, type, preorderId, userdata.role, preorder.company_id.name, notification_attachment_id);
                                    break;
                                case "order_warehousing":
                                    switch (currentUser.role) {
                                        case "account_manager":
                                            sendASNReceivedNotification(userdata._id, type, preorderId, userdata.role, preorder.company_id.name, notification_attachment_id);
                                            break;
                                        case "fork_lift_operator":
                                            sendReceiptConfirmationNotification(userdata._id, type, preorderId, userdata.role, preorder.company_id.name, notification_attachment_id);
                                            break;
                                        case "warehouse_supervisor":
                                            sendASNConfirmationNotification(userdata._id, type, preorderId, userdata.role, preorder.company_id.name, notification_attachment_id);
                                            break;
                                    }
                            }
                        }
                    });
                }
            });

        }
    });
};

function sendConfirmationNotification(userid, type, preoderid, userRole, companyname, notification_attachment_id) {
    switch (userRole) {
        case "account_manager":
            const message1 = {
                "name": "Dispatch No. " + notification_attachment_id,
                "description": 'New Packing List is received from ' + companyname,
            };
            global.eventEmitter.emit(global.sendNotification, userid, type, message1, 'pending', preoderid);
            break;
        case "sales_manager":
            const message2 = {
                "name": "Dispatch No. " + notification_attachment_id,
                "description": 'New Packing List is received from ' + companyname,
            };
            global.eventEmitter.emit(global.sendNotification, userid, type, message2, 'pending', preoderid);
            break;
    }
}


function sendASNReceivedNotification(userid, type, preoderid, userRole, companyname, notification_attachment_id) {
    switch (userRole) {
        case "account_manager":
            const message1 = {
                "name": "ASN No. " + notification_attachment_id,
                "description": 'ASN is generated for order from ' + companyname,
            };
            global.eventEmitter.emit(global.sendNotification, userid, type, message1, 'pending', preoderid);
            break;
        case "sales_manager":
            const message2 = {
                "name": "ASN No. " + notification_attachment_id,
                "description": 'ASN is generated for order from ' + companyname,
            };
            global.eventEmitter.emit(global.sendNotification, userid, type, message2, 'pending', preoderid);
            break;
        case "warehouse_supervisor":
            const message3 = {
                "name": "ASN No. " + notification_attachment_id,
                "description": 'ASN is generated for order from ' + companyname,
            };
            global.eventEmitter.emit(global.sendNotification, userid, type, message3, 'pending', preoderid);
            break;
    }
}

function sendASNConfirmationNotification(userid, type, preoderid, userRole, companyname, notification_attachment_id) {
    switch (userRole) {
        case "account_manager":
            const message1 = {
                "name": "ASN No. " + notification_attachment_id,
                "description": 'Products received from ' + companyname,
            };
            global.eventEmitter.emit(global.sendNotification, userid, type, message1, 'pending', preoderid);
            break;
        case "sales_manager":
            const message2 = {
                "name": "ASN No. " + notification_attachment_id,
                "description": 'Products received from ' + companyname,
            };
            global.eventEmitter.emit(global.sendNotification, userid, type, message2, 'pending', preoderid);
            break;
        case "fork_lift_operator":
            const message3 = {
                "name": "ASN No. " + notification_attachment_id,
                "description": 'Products received from ' + companyname,
            };
            global.eventEmitter.emit(global.sendNotification, userid, type, message3, 'pending', preoderid);
            break;
    }
}

function sendReceiptConfirmationNotification(userid, type, preoderid, userRole, companyname, notification_attachment_id) {
    switch (userRole) {
        case "account_manager":
            const message1 = {
                "name": "Dispatch No. " + notification_attachment_id,
                "description": 'Packing list is stored in Warehouse',
            };
            global.eventEmitter.emit(global.sendNotification, userid, type, message1, 'pending', preoderid);
            break;
        case "sales_manager":
            const message2 = {
                "name": "Dispatch No. " + notification_attachment_id,
                "description": 'Packing list is stored in Warehouse',
            };
            global.eventEmitter.emit(global.sendNotification, userid, type, message2, 'pending', preoderid);
            break;
    }
}

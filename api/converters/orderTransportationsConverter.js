const hasher = require('./hasher');

exports.convertToChaincode = function (data) {
    const hash = hasher.create(data["_id"]);

    const requestFromCompanyHash = hasher.create(data["request_from_company_id"]);
    const requestFromUserClientHash = hasher.create(data["request_from_client_user_id"]);
    const deliverFromVompanyHash = hasher.create(data["deliver_from_company_id"]);

    const deliverToCompanyHash = hasher.create(data["deliver_to_company_id"]);

    let managerUserHashes = [];
    if (data["manager_user_ids"] !== 'undefined' && data["manager_user_ids"]) {
        for (let i = 0; i < data["manager_user_ids"].length; i++) {
            managerUserHashes[i] = hasher.create(data["manager_user_ids"][i]);
        }
    }

    let driverUserHashes = [];
    if (data["driver_user_ids"] !== 'undefined' && data["driver_user_ids"]) {
        for (let i = 0; i < data["driver_user_ids"].length; i++) {
            driverUserHashes[i] = hasher.create(data["driver_user_ids"][i]);
        }
    }

    let clientUserHashes = [];
    if (data["client_user_ids"] !== 'undefined' && data["client_user_ids"]) {
        for (let i = 0; i < data["client_user_ids"].length; i++) {
            clientUserHashes[i] = hasher.create(data["client_user_ids"][i]);
        }
    }

    let truckHashes = [];
    if (data["truck_ids"] !== 'undefined' && data["truck_ids"]) {
        for (let i = 0; i < data["truck_ids"].length; i++) {
            truckHashes[i] = hasher.create(data["truck_ids"][i]);
        }
    }

    let lotsHashes = [];
    if (data["lots_ids"] !== 'undefined' && data["lots_ids"]) {
        for (let i = 0; i < data["lots_ids"].length; i++) {
            lotsHashes[i] = hasher.create(data["lots_ids"][i]);
        }
    }

    const preOrderhash = hasher.create(data["preorder_id"]);

    const urlhash = hasher.create(data["url_hash"]);

    return {
        Hash: hash,
        RequestFromCompanyHash: requestFromCompanyHash,
        RequestFromUserHash: requestFromUserClientHash,
        DeliverFromCompanyHash: deliverFromVompanyHash,
        DeliverToCompanyHash: deliverToCompanyHash,
        ManagerUserHashes: managerUserHashes,
        DriverUserHashes: driverUserHashes,
        ClientUserHashes: clientUserHashes,
        TruckHashes: truckHashes,
        PreOrderHash: preOrderhash,
        OrderNumber: data["order_number"],
        OrderStatus: data["order_status"],
        LotsHashes: lotsHashes,
        URLEnabled: true,
        URLHash: urlhash,
        URLHashExpTime: new Date().getTime(),
        URLCode: data["url_code"],
        Active: data["active"],
        Deleted: data["deleted"],
        Timestamp: new Date().getTime()
    };
};

exports.convertToMongo = function (data) {

};

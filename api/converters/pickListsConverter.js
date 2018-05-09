const hasher = require('./hasher');


exports.convertToChaincode = function (data) {
    const hash = hasher.create(data["_id"]);

    const transportationsHash = hasher.create(data["transportation_id"]);

    const orderTransportationHash = hasher.create(data["order_transportation_id"]);

    const comodityhash = hasher.create(data["commodity_id"]);

    let lotsHashes = [];
    if (data["lots_ids"] !== 'undefined' && data["lots_ids"]) {
        for (let i = 0; i < data["lots_ids"].length; i++) {
            lotsHashes[i] = hasher.create(data["lots_hashes"][i]);
        }
    }

    let productsHashes = [];
    if (data["product_ids"] !== 'undefined' && data["product_ids"]) {
        for (let i = 0; i < data["product_ids"].length; i++) {
            productsHashes[i] = hasher.create(data["product_ids"][i]);
        }
    }

    let storagesHashes = [];
    if (data["storages_ids"] !== 'undefined' && data["storages_ids"]) {
        for (let i = 0; i < data["storage_ids"].length; i++) {
            storagesHashes[i] = hasher.create(data["storages_ids"][i]);
        }
    }

    const companyHash = hasher.create(data["company_id"]);

    let managerUserHashes = [];
    if (data["manager_user_ids"] !== 'undefined' && data["manager_user_ids"]) {
        for (let i = 0; i < data["manager_user_ids"].length; i++) {
            managerUserHashes[i] = hasher.create(data["manager_user_ids"][i]);
        }
    }

    const forkliftOperatorUserHash = hasher.create(data["fork_lift_operator_user_id"]);

    return {
        Hash: hash,
        TransportationHash: transportationsHash,
        OrderTransportationHash: orderTransportationHash,
        ComodityHash: comodityhash,
        LotsHashes: lotsHashes,
        ProductHashes: productsHashes,
        Quantity: data["quantity"],
        StorageHashes: storagesHashes,
        CompanyHash: companyHash,
        ManagerUserHashes: managerUserHashes,
        Status: data["status"],
        ForkLiftOperatorUserHash: forkliftOperatorUserHash,
        Active: data["active"],
        Deleted: data["deleted"],
        Timestamp: new Date().getTime()
    };
};

exports.convertToMongo = function (data) {

};

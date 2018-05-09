const hasher = require('./hasher');


exports.convertToChaincode = function (data) {
    const hash = hasher.create(data["_id"]);

    let orderwarehousehash = "";
    if (data["order_warehousing_id"] !== undefined && data["order_warehousing_id"]){
        orderwarehousehash = hasher.create(data["order_warehousing_id"]);
    }

    let preorderhash = "";
    if (data["preorder_id"] !== undefined && data["preorder_id"]){
        preorderhash = hasher.create(data["preorder_id"]);
    }

    let lothash = "";
    if (data["lot_id"] !== undefined && data["lot_id"]) {
        lothash = hasher.create(data["lot_id"]);
    }

    let producthash = "";
    if (data["product_id"] !== undefined && data["product_id"]) {
        producthash = hasher.create(data["product_id"]);
    }

    let ownercompanyhash = "";
    if (data["owner_company_id"] !== undefined && data["owner_company_id"]){
        ownercompanyhash = hasher.create(data["owner_company_id"]);
    }

    let owneruserhashes = [];
    if (data["owner_user_ids"] !== undefined && data["owner_user_ids"].length > 0 ){
        for (let i = 0; i < data["owner_user_ids"].length; i++ ) {
            owneruserhashes[i] = hasher.create(data["owner_user_ids"][i]);
        }
    }

    let manageruserhashes = [];
    if (data["manager_user_ids"] !== undefined && data["manager_user_ids"].length > 0 ) {
        for (let i = 0; i < data["manager_user_ids"].length; i++) {
            manageruserhashes[i] = hasher.create(data["manager_user_ids"][i]);
        }
    }

    let actionhashes = [];
    if (data["action_ids"] !== undefined && data["action_ids"].length > 0 ) {
        for (let i = 0; i < data["action_ids"].length; i++ ) {
            actionhashes[i] = hasher.create(data["action_ids"][i])
        }
    }

    let storagehashes = [];
    if (data["storage_ids"] !== undefined && data["storage_ids"].length > 0 ) {
        for (let i = 0; i < data["storage_ids"]; i++) {
            storagehashes[i] = hasher.create(data["storage_ids"][i]);
        }
    }

    let batchnumber = "";
    if (data["batch_number"] !== undefined && data["batch_number"]) {
        batchnumber = hasher.create(data["batch_number"]);
    }

    let forkliftoperatorhashes = [];
    if (data["fork_lift_operator_user_id"] !== undefined && data["fork_lift_operator_user_id"].length > 0 ) {
        for ( let i = 0; i < data["fork_lift_operator_user_id"].length; i++ ) {
            forkliftoperatorhashes[i] = hasher.create(data["fork_lift_operator_user_id"][i]);
        }
    }


    return {
        Hash: hash,
        OrderWarehouseHash: orderwarehousehash,
        LotHash: lothash,
        PreOrderHash:preorderhash,
        ProductHash: producthash,
        OwnerCompanyHash: ownercompanyhash,
        OwnerUserHashes: owneruserhashes,
        ManagerUserHashes: manageruserhashes,
        ActionHashes: actionhashes,
        StorageHashes: [storagehashes],
        BatchNumber: batchnumber,
        ForkLiftOperatorHashes: forkliftoperatorhashes,
        Active: data["active"],
        Deleted: data["deleted"],
        Timestamp: data["timestamp"].getTime()
    };
};

exports.convertToMongo = function (data) {

};

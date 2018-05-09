const hasher = require('./hasher');

exports.convertToChaincode = function (data) {
    let hash = hasher.create(data["_id"]);

    let producthash = "";
    if (data["product_id"] !== undefined && data["product_id"]) {
        producthash = hasher.create(data["product_id"]);
    }

    let parentlothash = "";
    if (data["parent_lot_id"] !== undefined && data["parent_lot_id"]) {
        parentlothash = hasher.create(data["parent_lot_id"]);
    }

    let ownercompanyhash = "";
    if (data["owner_company_id"] !== undefined && data["owner_company_id"]) {
        ownercompanyhash = hasher.create(data["owner_company_id"]);
    }

    let owneruserhashes = [];
    if (data["owner_user_ids"] !== undefined && data["owner_user_ids"].length > 0) {
        for (let i = 0; i < data["owner_user_ids"].length; i++) {
            owneruserhashes[i] = hasher.create(data["owner_user_ids"][i]);
        }
    }

    let manageruserhashes = [];
    if (data["manager_user_ids"] !== undefined && data["manager_user_ids"].length > 0) {
        for (let i = 0; i < data["manager_user_ids"].length; i++) {
            manageruserhashes[i] = hasher.create(data["manager_user_ids"][i]);
        }
    }
    let lotnumber = "";
    if (data["lot_number"] !== undefined && data["lot_number"]) {
        lotnumber = data["lot_number"];
    }
    let quantity;
    if (data["quantity"] !== undefined && data["quantity"]){
        quantity = data["quantity"];
    }

    let netweight = "";
    if (data["net_weight"] !== undefined && data["net_weight"]) {
        netweight = String(data["net_weight"]);
    }

    let grossweight = "";
    if (data["gross_weight"] !== undefined && data["gross_weight"]) {
        grossweight = String(data["gross_weight"]);
    }

    let batchnumber = "";
    if (data["batch_number"] !== undefined && data["batch_number"]){
        batchnumber = data["batch_number"];
    }

    return {
        Hash: hash,
        ProductHash: producthash,
        ParentLotHash: parentlothash,
        OwnerCompanyHash: ownercompanyhash,
        OwnerUserHashes: owneruserhashes,
        ManagerUserHashes: manageruserhashes,
        LotNumber: lotnumber,
        Quantity: quantity,
        NetWeight: netweight,
        GrossWeight: grossweight,
        BatchNumber: batchnumber,
        ExpDate: data["exp_date"].getTime(),
        Active: data["active"],
        Deleted: data["deleted"],
        Timestamp: data['timestamp'].getTime()
    };
};

exports.convertToMongo = function (data) {

};
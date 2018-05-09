const hasher = require('./hasher');


exports.convertToChaincode = function (data) {
    const hash = hasher.create(data["_id"]);

    let ownercompanyhash = "";
    if (data["owner_company_id"] !== undefined && data["owner_company_id"] ) {
        ownercompanyhash = hasher.create(data["owner_company_id"]);
    }

    let owneruserhashes = [];
    if (data["owner_user_ids"] !== undefined && data["owner_user_ids"].length > 0 ) {
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

    let preorderhash = "";
    if (data["preorder_id"] !== undefined && data["preorder_id"]) {
        preorderhash = hasher.create(data["preorder_id"]);
    }

    let ordernumber = "";
    if (data["order_number"] !== undefined && data["order_number"] ){
        ordernumber = data["order_number"];
    }
    let orderstatus = "";
    if (data["order_status"] !== undefined && data["order_status"]) {
        orderstatus = data["order_status"];
    }

    let lotshashes = [];
    if (data["lots"] !== undefined && data["lots"].length > 0) {
        for (let i = 0; i < data["lots"].length; i++) {
            lotshashes[i] = hasher.create(data["lots"][i]);
        }
    }

    let urlhash = "";
        if (data["url_hash"] !== undefined && data["url_hash"]) {
        urlhash = hasher.create(data["url_hash"]);
    }

    let urlcode = "";
    if (data["url_code"] !== undefined && data["url_code"]) {
        urlcode = data["url_code"];
    }

    return {
        Hash: hash,
        OwnerCompanyHash: ownercompanyhash,
        OwnerUserHashes: owneruserhashes,
        ManagerUserHashes: manageruserhashes,
        PreOrderHash: preorderhash,
        OrderNumber: ordernumber,
        OrderStatus: orderstatus,
        LotsHashes: lotshashes,
        URLEnabled: data["url_enabled"],
        URLHash: urlhash,
        URLHashExpTime: data["URLHashExpTime"],
        URLCode: urlcode,
        Active: data["active"],
        Deleted: data["deleted"],
        Timestamp: new Date().getTime()
    };
};

exports.convertToMongo = function (data) {

};

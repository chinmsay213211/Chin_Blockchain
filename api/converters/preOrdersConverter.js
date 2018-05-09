const hasher = require('./hasher');


exports.convertToChaincode = function (data) {
    const hash = hasher.create(data["_id"]);

    let company_idHash = "";

    if (data["company_id"] !== undefined) {
        company_idHash = hasher.create(data["company_id"]);
    }
    console.log("show company hash", company_idHash);


    let statusesHashes =[];
    if (data["statuses"] !== undefined && data["statuses"].length > 0) {
        for (let i = 0; i < data["statuses"].length; i++) {
            statusesHashes[i] = {"type":data["statuses"][i]["type"],"UserHash":hasher.create(data["statuses"][i]["user_id"]),"StatusHash":hasher.create(data["statuses"][i]["_id"])};
        }
    }
    let clientUserHashes = [];
    if (data["client_user_ids"] !== undefined && data["client_user_ids"].length > 0) {
        for (let i = 0; i < data["client_user_ids"].length; i++) {
            clientUserHashes[i] = hasher.create(data["client_user_ids"][i]);
        }
    }



    let managerUserHashes = [];
    if (data["manager_user_ids"] !== undefined && data["manager_user_ids"].length > 0) {
        for (let i = 0; i < data["manager_user_ids"].length; i++) {
            managerUserHashes[i] = hasher.create(data["manager_user_ids"][i]);
        }
    }
    let shipperhash = "";
    if (data["shipper"] !== undefined) {
        shipperhash = hasher.create(data["shipper"]);
    }

    let shiptohash = "";
    if (data["ship_to"] !== undefined) {
        shiptohash = hasher.create(data["ship_to"]);
    }

    return {
        Hash: hash,
        CompanyHash: company_idHash,
        StatusesHashes: statusesHashes,
        ManagerUserHashes: managerUserHashes,
        ClientUserHashes: clientUserHashes,
        DispatchNo: data["dispatch_no"],
        ShipperHash: shipperhash,
        ShipToHash: shiptohash,
        Deleted: data["deleted"],
        Active: data["active"],
        ExpDate: new Date().getTime(),
        Timestamp: new Date().getTime()
    };
};

exports.convertToMongo = function (data) {

};

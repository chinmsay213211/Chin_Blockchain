const hasher = require('./hasher');

exports.convertToChaincode = function (data) {
    const hash = hasher.create(data["_id"]);

    let managerUserHashes = [];
    if (data["manager_user_ids"] !== 'undefined' && data["manager_user_ids"]) {
        for (let i = 0; i < data["manager_user_ids"].length; i++) {
            managerUserHashes[i] = hasher.create(data["manager_user_ids"][i]);
        }
    }

    let companyHash = "";
    if (data["company_id"] !== undefined) {
        companyHash = hasher.create(data["company_id"]);
    }

    return {
        Hash: hash,
        Name: data["name"],
        ManagerUserHash: managerUserHashes,
        Country: data["country"],
        State: data["state"],
        Address: data["address"],
        NearBy: data["near_by"],
        Location: data["location"],
        CompanyHash: companyHash,
        Timestamp: new Date().getTime()
    };
};

exports.convertToMongo = function (data) {

};

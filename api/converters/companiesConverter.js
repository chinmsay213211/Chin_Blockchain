const hasher = require('./hasher');

exports.convertToChaincode = function (data) {

    let hash = hasher.create(data["_id"]);

    let name = "";
    if (data["name"] !== undefined && data["name"] ){
        name = data["name"];
    }

    // let clientofcompanyhash = "";
    //     if (data["client_of_company_id"] !== undefined && data["client_of_company_id"].length > 0 ) {
    //         clientofcompanyhash = hasher.create(data["client_of_company_id"]);
    //     }

    let manageruserhashes = [];
    if (data["manager_user_ids"] !== undefined && data["manager_user_ids"].length > 0 ) {
        for (let i = 0; i < data["manager_user_ids"].length; i++) {
            manageruserhashes[i] = hasher.create(data["manager_user_ids"][i]);
        }
    }

    let phonenumber = "";
    if (data["phone_number"] !== undefined && data["phone_number"]) {
        phonenumber = data["phone_number"];
    }

    let email = "";
    if (data["email"] !== undefined && data["email"]){
        email = data["email"];
    }

    return {
        Hash: hash,
        Name: name,
        // ClientOfCompanyHash: clientofcompanyhash,
        ManagerUserHashes: manageruserhashes,
        PhoneNumber: phonenumber,
        Email: email,
        Active: data["active"],
        Deleted: data["deleted"],
        Timestamp: data["timestamp"].getTime()
    };
};

exports.convertToMongo = function (data) {

};

const hasher = require('./hasher');


exports.convertToChaincode = function (data) {
    let hash = hasher.create(data["_id"]);

    let name = "";
    if (data["name"] !== undefined && data["name"]) {
        name = data["name"];
    }

    let serialnumber = "";
    if (data["serial_number"]) {
        serialnumber = data["serial_number"];
    }



    return {
        Hash: hash,
        Name: name,
        SerialNumber: serialnumber,
        Active: data["active"],
        Deleted: data["deleted"],
        Timestamp: data["timestamp"].getTime()
    };
};

exports.convertToMongo = function (data) {

};

const hasher = require('./hasher');


exports.convertToChaincode = function (data) {
    const hash = hasher.create(data["_id"]);

    const transportationHash = hasher.create(data["transportation_id"]);

    return {
        Hash: hash,
        TransportationHash: transportationHash,
        Position: data["position"],
        Speed: data["speed"] ,
        Notes: data["notes"],
        Priority: data["priority"],
        Active: data["active"],
        Deleted: data["deleted"],
        Timestamp: new Date().getTime()
    };
};

exports.convertToMongo = function (data) {

};

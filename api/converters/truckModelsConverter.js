const hasher = require('./hasher');


exports.convertToChaincode = function (data) {
    const hash = hasher.create(data["_id"]);

    const truckMakesHash = hasher.create(data["truck_makes_id"]);

    return {
        Hash: hash,
        TruckMakesHash: truckMakesHash ,
        Name: data["name"] ,
        Active: data["active"],
        Deleted: data["deleted"],
        Timestamp: new Date().getTime()
    };
};

exports.convertToMongo = function (data) {

};

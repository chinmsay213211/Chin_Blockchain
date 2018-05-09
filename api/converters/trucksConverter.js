const hasher = require('./hasher');


exports.convertToChaincode = function (data) {
    const hash = hasher.create(data["_id"]);

    const truckMakesHash = hasher.create(data["truck_makes_id"]);

    const truckModelsHash = hasher.create(data["truck_models_id"]);

    return {
        Hash: hash,
        TruckMakesHash: truckMakesHash ,
        TruckModelHash: truckModelsHash ,
        Number: data["number"] ,
        PlateNumber: data["plate_number"],
        Timestamp: new Date().getTime()
    };
};

exports.convertToMongo = function (data) {

};

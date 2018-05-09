const hasher = require('./hasher');


exports.convertToChaincode = function (data) {
    let hash = hasher.create(data["_id"]);

    let pallethash = "";
    if (data["pallet_id"] && data["pallet_id"]) {
        pallethash = hasher.create(data["pallet_id"]);
    }

    let rackhash = "";
    if (data["rack_id"] && data["rack_id"].length > 0 ) {
        rackhash = hasher.create(data["rack_id"]);
    }
    //
    // let location = "";
    // if (data["location"] !== 'undefined' && data["location"].length > 0 ) {
    //     location = {"latitude":data["location"]["latitude"],"longtitude":data["location"]["longtitude"]};
    // }

    let storagerating = "";
    if (data["storage_rating"] && data["storage_rating"].length > 0 ) {
        storagerating = data["storage_rating"];
    }

    return {
        Hash: hash,
        PalletHash: pallethash,
        RackHash: rackhash,
        Occupied: data["occupied"],
        Location: data["location"],
        StorageRating: storagerating,
        Active: data["active"],
        Deleted: data["deleted"],
        Timestamp: data['timestamp'].getTime()
    };
};

exports.convertToMongo = function (data) {

};

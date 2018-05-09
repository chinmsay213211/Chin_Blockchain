const hasher = require('./hasher');

exports.convertToChaincode = function (data) {

    let hash = hasher.create(data["_id"]);

    let name = "";
    if (data["file"] !== undefined && data["file"] ){
        file = data["file"];
    }

    let userhashes = [];
    if (data["user_id"] !== undefined && data["user_id"].length > 0 ) {
        for (let i = 0; i < data["user_id"].length; i++) {
            userhashes[i] = hasher.create(data["user_id"][i]);
        }
    }


    return {
        Hash: hash,
        File: file,
        UserHashes: userhashes
    };
};

exports.convertToMongo = function (data) {

};

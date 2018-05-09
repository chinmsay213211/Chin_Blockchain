const hasher = require('./hasher');

exports.convertToChaincode = function (data) {
    const hash = hasher.create(data["_id"]);

    return {
        Hash: hash,
        Name: data["name"],
        ActionType: data["action_type"],
        Files: data["files"],
        Timestamp: new Date().getTime()
    };
};

exports.convertToMongo = function (data) {
};




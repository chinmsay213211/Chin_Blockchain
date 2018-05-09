const hasher = require('./hasher');

exports.convertToChaincode = function (data) {
    const hash = hasher.create(data["_id"]);

    return {
        Hash: hash,
        Name: data["name"],
        Description: data['description'],
        Active: data['active'],
        Deleted: data['deleted'],
        Timestamp: new Date().getTime()
    };
};

exports.convertToMongo = function (data) {
};
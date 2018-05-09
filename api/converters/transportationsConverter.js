const hasher = require('./hasher');


exports.convertToChaincode = function (data) {
    const hash = hasher.create(data["_id"]);

    const orderTransportationHash = hasher.create(data["order_transportation_id"]);

    let deliveryVoucherHashes = [];
    if (data["delivery_voucher_ids"] !== 'undefined' && data["delivery_voucher_ids"]) {
        for (let i = 0; i < data["delivery_voucher_ids"].length; i++) {
            deliveryVoucherHashes[i] = hasher.create(data["delivery_voucher_ids"][i]);
        }
    }

    let actionHashes = [];
    if (data["action_ids"] !== 'undefined' && data["action_ids"]) {
        for (let i = 0; i < data["action_ids"].length; i++) {
            actionHashes[i] = hasher.create(data["action_ids"][i]);
        }
    }

    return {
        Hash: hash,
        OrderTransportationHash: orderTransportationHash,
        DeliveryVoucherHashes: deliveryVoucherHashes,
        ActionHash: actionHashes,
        Timestamp: new Date().getTime()
    };
};

exports.convertToMongo = function (data) {

};

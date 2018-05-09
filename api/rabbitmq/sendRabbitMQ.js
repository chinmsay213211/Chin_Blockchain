const path = require('path'),
    amqp = require('amqplib/callback_api'),
    config = require('config'),
    invoke_transaction = require('../controllers/lib/invoke-transaction'),
    logger = require("../../logger");

const loggerName = "[SendRabbitMQ]: ";

exports.send = function(chaincodeID, func, args, callback) {
    let peerUrls = [config.tristar_peer_url + ":7051"];

    invoke_transaction.invokeChaincode(peerUrls,
            config.channelName,
            chaincodeID,
            func,
            args,
            "admin",
            "org_tristar")
        .then(function(result) {
            callback(null,result);
        }, (err) => {
            logger.error(loggerName, "Catched error: " + err);
            callback(err);
        });

    /*amqp.connect(config.rabbitHost, function(err, conn) {
        conn.createChannel(function(err, ch) {
            ch.assertQueue(config.rabbitChannel, {
                durable: false
            });

            let invokeStruct = {
                chaincodeID: chaincodeID,
                channelName: config.channelName,
                func: func,
                args: args
            };

            ch.sendToQueue(config.rabbitChannel, Buffer.from(JSON.stringify(invokeStruct)));
        });
    });*/
};
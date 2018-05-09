/*
const path = require('path'),
    amqp = require('amqplib/callback_api'),
    util = require('util'),
    config = require('config'),
    invoke_transaction = require('../controllers/lib/invoke-transaction'),
    logger = require("../../logger");

const loggerName = "[ReceiveRabbitMQ]: ";

amqp.connect(config.rabbitHost, function (err, conn) {
    conn.createChannel(function (err, ch) {
        logger.info('[ReceiveRabbitMQ]: ', "RabbitMQ channel has been created succesfully");
        ch.assertQueue(config.rabbitChannel, {durable: false});

        ch.consume(config.rabbitChannel, function (msg) {
            let data = JSON.parse(String.fromCharCode.apply(String, msg.content));

            let peerUrls = ["localhost:7051"];

            invoke_transaction.invokeChaincode(peerUrls, data.chaincodeID, data.func, data.args, "admin", "org_tristar")
                .then(function(result) {
                if (error) {
                    logger.error(loggerName, "Error: "  + error + ", Message: " + message);
                    throw error;
                }
            });
        }, {noAck: true});
    });
});

let processMessage = function (msg) {

};
*/

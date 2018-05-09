"use strict";
const path = require('path'),
    amqp = require('amqplib/callback_api'),
    util = require('util'),
    config = require('config'),
    async = require('async'),
    truncate = require('truncate'),
    query = require('../controllers/lib/query'),
    logger = require("../../logger");
const loggerName = "[Explorer Controller]: ";
exports.explorer = function (req, res) {
    let peer = ["peer0"];
    query.getChainInfo(peer, "admin", "org_tristar").then(
        function (message) {
            let blockNumber = message["height"]["low"];
            oneByOne(peer, 0, blockNumber, res);
        });
};
var finalresult = [];

function oneByOne(peer, index, blockNumber, res) {
    if (index + 1 < blockNumber) {
        query.getBlockByNumber(peer, index, "admin", "org_tristar").then(
            function (message1) {
                let dataHash = truncate(message1["header"]["data_hash"], 18);
                let previousHash = truncate(message1["header"]["previous_hash"], 18);
                let transactionid = message1["data"]["data"][0]["payload"]["header"]["channel_header"]["tx_id"];
                oneByOne(peer, index + 1, blockNumber, res);
                finalresult[index] = {
                    blockheight: index,
                    currenthash: dataHash,
                    previoushash: previousHash,
                    transactionid: transactionid
                };
            });
    } else {
        res.json(finalresult.reverse());
    }
}


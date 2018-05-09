
"use strict";
const path = require('path'),
    amqp = require('amqplib/callback_api'),
    util = require('util'),
    config = require('config'),
    async = require('async'),
    query = require('../controllers/lib/query'),
    logger = require("../../logger");
const loggerName = "[Explorer Logs]: ";
exports.explorerlogs = function (req, res) {
    let peer = ["peer0"];
    var finalresult={};
    let blocknumber = req.params.blockheight;
    query.getBlockByNumber(peer, blocknumber, "admin", "org_tristar").then(
            function (message1) {
                // logger.debug(loggerName, "MESSAGE DATA" + util.inspect(message1["data"]["data"][0]["payload"]["data"]["actions"][0], {
                //     showHidden: false,depth:null
                // }));
                //---
                let signaturebuffer = message1["data"]["data"][0]["signature"];
                let signature = signaturebuffer.toString('base64');
                let timestamp = message1["data"]["data"][0]["payload"]["header"]["channel_header"]["timestamp"];
                let channelid = message1["data"]["data"][0]["payload"]["header"]["channel_header"]["channel_id"];
                let idBytes = message1["data"]["data"][0]["payload"]["header"]["signature_header"]["creator"]["IdBytes"];
                let noncebuffer = message1["data"]["data"][0]["payload"]["header"]["signature_header"]["nonce"];
                let nonce = noncebuffer.toString('base64');
                let statehash = message1["header"]["data_hash"];
                let previoushash = message1["header"]["previous_hash"];
                finalresult={
                    blockheight: blocknumber,
                    timestamp: timestamp,
                    statehash: statehash,
                    previoushash: previoushash,
                    channelid: channelid,
                    idBytes: idBytes,
                    signature: signature,
                    nonce: nonce
                };
                res.json(finalresult);
            });

    };


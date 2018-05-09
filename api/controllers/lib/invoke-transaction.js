'use strict';
var path = require('path');
var fs = require('fs');
var util = require('util');
var hfc = require('fabric-client');
var Peer = require('fabric-client/lib/Peer.js');
var config = require('config');
var helper = require('./helper.js');
var logger = require('../../../logger');
var EventHub = require('fabric-client/lib/EventHub.js');
hfc.addConfigFile(path.join(__dirname, config.network_config_file + ".json"));
var ORGS = hfc.getConfigSetting("network-config");
const loggerName = "[Invoke-Transacton]: ";
var invokeChaincode = function (peersUrls, channelName, chaincodeName, fcn, args, username, org) {
    logger.debug(util.format('\n============ invoke %s on organization %s ============\n', chaincodeName, org));
    var client = helper.getClientForOrg(org);
    var channel = helper.getChannelForOrg(org);
    var targets = helper.newPeers(peersUrls);

    var tx_id = null;
    return helper.getRegisteredUsers(username, org).then((user) => {
        tx_id = client.newTransactionID();
        logger.debug(util.format('Sending transaction "%s"', chaincodeName));
        // send proposal to endorser
        var request = {
            targets: targets,
            chaincodeId: chaincodeName,
            fcn: fcn,
            args: args,
            chainId: channelName,
            txId: tx_id
        };

        return channel.sendTransactionProposal(request);
    }, (err) => {
        logger.error('Failed to enroll user \'' + username + '\'. ' + err);
        throw new Error('Failed to enroll user \'' + username + '\'. ' + err);
    }).then((results) => {
        var proposalResponses = results[0];
        var proposal = results[1];
        var all_good = true;
        for (var i in proposalResponses) {
            var one_good = false;
            if (proposalResponses && proposalResponses[0].response &&
                proposalResponses[0].response.status === 200) {
                one_good = true;
                logger.info('transaction proposal was good');
            } else {
                logger.error('transaction proposal was bad');
            }
            all_good = all_good & one_good;
        }
        if (all_good) {
            // logger.debug(util.format(
            //     'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
            //     proposalResponses[0].response.status, proposalResponses[0].response.message,
            //     proposalResponses[0].response.payload, proposalResponses[0].endorsement
            //         .signature));
            var request = {
                proposalResponses: proposalResponses,
                proposal: proposal
            };
            // set the transaction listener and set a timeout of 30sec
            // if the transaction did not get committed within the timeout period,
            // fail the test
            var transactionID = tx_id.getTransactionID();
            var eventPromises = [];

            var eventhubs = helper.newEventHubs(peersUrls, org);
            for (var key in eventhubs) {
                var eh = eventhubs[key];
                eh.connect();

                var txPromise = new Promise((resolve, reject) => {
                    var handle = setTimeout(() => {
                        eh.disconnect();
                        reject();
                    }, 30000);

                    eh.registerTxEvent(transactionID, (tx, code) => {
                        clearTimeout(handle);
                        eh.unregisterTxEvent(transactionID);
                        eh.disconnect();

                        if (code !== 'VALID') {
                            logger.error(
                                'Transaction was invalid, code = ' + code);
                            reject();
                        } else {
                            logger.info(
                                'Transaction has been committed on peer ' +
                                eh._ep._endpoint.addr);
                            resolve();
                        }
                    });
                });
                eventPromises.push(txPromise);
            };
            var sendPromise = channel.sendTransaction(request);
            return Promise.all([sendPromise].concat(eventPromises)).then((results) => {
                logger.debug(' event promise all complete and testing complete');
                return results[0];
            }).catch((err) => {
                logger.error(
                    chaincodeName + ' failed to send transaction and get notifications within the timeout period. Error: ' + err
                );
                return chaincodeName + ' failed to send transaction and get notifications within the timeout period. Error: ' + err;});
        } else {
            logger.error(
                chaincodeName + ' failed to send Proposal or receive valid response. Response null or status is not 200. exiting...'
            );
            return chaincodeName + ' failed to send Proposal or receive valid response. Response null or status is not 200. exiting...';
        }
    }, (err) => {
        logger.error(chaincodeName + ' failed to send proposal due to error: ' + err.stack ? err.stack :
            err);
        return chaincodeName + ' failed to send proposal due to error: ' + err.stack ? err.stack :
            err;
    }).then((response) => {
        if (response.status === 'SUCCESS') {
            /*logger.info('Successfully sent transaction to the orderer.');
            return tx_id.getTransactionID();*/
            return {
                success: true,
                result: tx_id.getTransactionID()
            };
        } else {
            /*logger.error('Failed to order the transaction. Error code: ' + response);
            return 'Failed to order the transaction. Error code: ' + response;*/
            return {
                success: false,
                result: response
            };
        }
    }, (err) => {
        /*logger.error('Failed to send transaction due to error: ' + err.stack ? err .stack : err);
        return 'Failed to send transaction due to error: ' + err.stack ? err.stack : err;*/
        return {
            success: false,
            result: err
        };
    });
};

exports.invokeChaincode = invokeChaincode;
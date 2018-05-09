"use strict";

// global variables
const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    config = require('config'),
    port = process.env.PORT || config.port,
    mongoose = require('mongoose'),
    logger = require('./logger'),
    util = require('util'),
    fs = require('fs'),
    acl = require('express-acl'),
    http = require('http'),
    server = http.createServer(app),
    events = require('events');
    global.eventEmitter = new events.EventEmitter();
    global.io = require("socket.io").listen(3009);
    global.io.sockets.on('connection', function (socket) {
    socket.on('disconnect', function () {
    });
});


const usersModel = require('./api/models/usersModel'),
    companiesModel = require('./api/models/companiesModel'),
    locationsModel = require('./api/models/locationsModel'),
    sessionsModel = require('./api/models/sessionsModel'),
    activitiesModel = require('./api/models/activitiesModel'),
    preOrdersModel = require('./api/models/preOrdersModel'),
    trucksModel = require('./api/models/trucksModel'),
    truckMakesModel = require('./api/models/truckMakesModel'),
    deliveryVouchersModel = require('./api/models/deliveryVouchersModel'),
    lotsModel = require('./api/models/lotsModel'),
    productsModel = require('./api/models/productsModel'),
    warehousesModel = require('./api/models/warehousesModel'),
    transportationsModel = require('./api/models/transportationsModel'),
    actionsModel = require('./api/models/actionsModel'),
    storagesModel = require('./api/models/storagesModel'),
    pickListsModel = require('./api/models/pickListsModel'),
    transportationLogsModel = require('./api/models/transportationLogsModel'),
    orderWarehousesModel = require('./api/models/orderWarehousesModel'),
    truckModelsModel = require('./api/models/truckModelsModel'),
    orderTransportationsModel = require('./api/models/orderTransportationsModel'),
    notificationsModel = require('./api/models/notificationsModel'),
    trucksGpsModel = require('./api/models/trucksGpsModel'),
    commoditiesModel = require('./api/models/commoditiesModel'),
    filesModel = require('./api/models/filesModel');

const sendRabbitMQ = require('./api/rabbitmq/sendRabbitMQ')/*,
    receiveRabbitMQ = require('./api/rabbitmq/receiveRabbitMQ')*/;

const multipart = require('connect-multiparty'),
    multipartMiddleware = multipart();

const loggerName = "[Server]: ";

app.use(bodyParser.urlencoded({extended: true, limit: '100mb'}));
app.use(bodyParser.json({limit: '100mb'}));

app.on('uncaughtException', function (err) {
    logger.error(loggerName, "UNCAUGHT EXCEPTION: " + err);
});

app.on('error', function (err) {
    logger.error(loggerName, "ERROR: " + err);
});

// mongoose connection
mongoose.Promise = global.Promise;
mongoose.connect(config.db);
let db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function () {
    logger.info('[Server]:', 'Connection with MongoDB installed');
});


// Enable Cross Origin Resource Sharing
app.all('/*', function (req, res, next) {
    // CORS headers
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    // Set custom headers for CORS
    res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key,Cache-Control,X-Requested-With,Access-Control-Allow-Origin,Access-Control-Allow-Credentials');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
});


// Web Authentication
app.post('/api/v1/webauth', function (req, res) {
    const invitationCode = req.body.invitation_code;
    const uuid = req.body.webtoken;
    if (!invitationCode || !uuid) {
        return res.status(401).json(
            {
                success: false,
                result: "Authentication failed"
            }
        );
    }
    let msg = {'op': 'authdone', 'invitationCode': invitationCode};
    if (clients[uuid] !== undefined || clients[uuid] !== null) {
        clients[uuid].send(JSON.stringify(msg), {mask: false});
        delete clients[uuid];
        return res.status(200).json(
            {
                success: true,
                result: "Successfully logged in"
            }
        );
    }
    else {
        return res.status(401).json(
            {
                success: false,
                result: "Authentication failed"
            }
        );
    }
});


// File upload
app.post('/packing-list-upload/:user_id', multipartMiddleware, function (req, res) {
    const userId = req.params.user_id;

    logger.debug(loggerName, "{packing-list-upload}: Got file request from: " + userId);
    logger.debug(loggerName, "{packing-list-upload}: " + util.inspect(req.files, {showHidden: false}));

    if (userId === null || userId === 'undefined') {
        res.status(400);
        res.send("User is undefined");
        return;
    }

    fs.readFile(req.files.file.path, function (err, data) {
        if (err) {
            res.send(err);
            throw err;
        }

        let newFile = new filesModel({
            user_id: userId,
            file: new Buffer(data).toString('base64')
        });

        newFile.save(function (err, savedFile) {
            if (err) {
                res.status(400);
                res.send("Can not parse image");
                return;
            }

            logger.debug(loggerName, "file saved");
            res.send("Saved");
        });

    });
});

// Auth Middleware - This will check if the token is valid
// Only the requests that start with /api/v1/* will be checked for the token.
app.all('/api/v1/*', [require('./api/middlewares/validateRequest')]);

acl.config({
    filename: 'nacl.json',
    path: __dirname,
    status: 'Access Denied by Role',
    message: 'Access Denied by Role',
    baseUrl: '/api/v1/'
});

app.use(acl.authorize.unless({path: ['/api/v1/auth']}));

// // Make io accessible to our router
// app.use(function (req, res, next) {
//     req.io = io;
//     next();
// });

let routes = require('./api/routes/routes');
routes(app);

// If no route is matched by now, it must be a 404
app.use(function (req, res) {
    let err = new Error(req.originalUrl + ' not Found');
    err.status = 404;
    res.status(404).send();
});


// Websocket for QR Code
let WebSocketServer = require('ws').Server;
let uuid = require('uuid');
let wss = new WebSocketServer({path: '/gencode', port: 8000});


let clients = {};
let dumCounter = 0;
wss.on('connection', function connection(ws) {

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
        let obj = JSON.parse(message);
        if (obj.op === 'getwebqr') {
            let uuidToken = uuid.v1();
            clients[uuidToken] = ws;
            let hello = {op: 'qrcode', token: uuidToken};
            ws.send(JSON.stringify(hello), {mask: false});
        }
        else if (obj.op === 'destroywebqr') {
            delete clients[obj.op.uuid];
        }

    });

});

//API
app.listen(port);

logger.info('[Server]:', 'Tristar-POC-1 RESTful API server started on: ' + port);

// function getDistance(s1, s2)
// {
//     let a = s1.replace(/ /g, '').toLowerCase();
//     let b = s2.replace(/ /g, '').toLowerCase();
//     let costs = [];
//     for (let j = 0; j < b.length+1; j++) {
//         costs[j] = j;
//     }
//     for (let i = 1; i <= a.length; i++) {
//         costs[0] = i;
//         let nw = i - 1;
//         for (let j = 1; j <= b.length; j++) {
//             let cj = Math.min(1 + Math.min(costs[j], costs[j - 1]),
//                 a.charAt(i - 1) == b.charAt(j - 1) ? nw : nw + 1);
//             nw = costs[j];
//             costs[j] = cj;
//         }
//     }
//     return costs[b.length];
// };
//
// productsModel.find({}, function (err, products) {
//     if (err) {
//         console.log(err);
//     }
//     else {
//         console.log(getProductID("241004-090-ENOC Reduct 220-20 lit pail",products));
//     }
// });
//
// function getProductID(name, productsData)
// {
//     let distances=[];
//     for(let i=0;i<productsData.length;i++)
//     {
//         let distance=getDistance(productsData[i].serial_number+"-"+productsData[i].name,name);
//         distances.push(distance);
//     }
//     distances.sort(function (a,b) {
//         return a-b;
//     });
//
//     for(let i=0;i<productsData.length;i++)
//     {
//         let distance=getDistance(productsData[i].serial_number+"-"+productsData[i].name,name);
//         if(distance===distances[0])
//         {
//             return productsData[i];
//         }
//     }
//
// };

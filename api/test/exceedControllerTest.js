const exceedController = require('../controllers/exceedController'),
      exceedDVController = require('../controllers/exceedDVController');
var   logger = require('../../logger');
const err = [];
//
// var returnId = exceedController.processPackingList("shippername", "abudhabi", "dispatchno123", 20170101, "drivername1",
//                              "Vehicleno1234", "containerno1234", "TRISTAR",1000.01, 1000.01, 120.00, 100, "YES");
// {
//
//                 if (err) {
//                     logger.error("Can not post PostgresSQL DB %s", returnId);}
//
//  };

        var location = Array();
            location[0] = {"longitude":"25.0432978","lattitude": "55.2518346"};
            location[1] = {"longitude":"26.0432978","lattitude": "57.2518346"};



var interval = 5000; // 10 seconds;

for (var i = 0; i <location.length; i++) {
    setTimeout( function (i) {
        exceedDVController.processGpsTracking(location[i]);
    }, interval * i, i);
}



//         var status = exceedDVController.processGpsTracking("longitude","lattitude");
// {
//                 if (err) {
//                     logger.error("cannot send data")
//                 }
// }
//
//     var  exceedController.processPackingListItems("1001234001", "100", "Atra", "lot1234001", "1001",
//                                                 "1000", "1000");

// {
//
//             if (err) throw err; // Check for the error and throw if it exists.
//             console.log('got data: '+returnId1); // Otherwise proceed as usual.
// };

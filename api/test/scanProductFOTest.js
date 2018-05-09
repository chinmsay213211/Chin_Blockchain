/**
 * Created by vinod on 16/07/17.
 */
const exceedController = require('../controllers/exceedController');
var logger = require('../../logger');

let product_code = "ugiqvzwih020yk8x5hfr";
let rack_id = 10;
let pallet_id = 10;
exceedController.getExceedCode(product_code, function (err, exceed_code) {
    if (err) {
        logger.error("getExceedCode Error", err);
    }
    else {
        exceedController.scanProductFO(exceed_code, rack_id, pallet_id, function (err, result) {
            if (err) {
                logger.error("scanProductFO Error", err);
            }
            else {
                logger.info("scanProductFO updated exceed code", result);
            }
        });
    }
});

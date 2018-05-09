/**
 * Created by vinod on 16/07/17.
 */
const exceedController = require('../controllers/exceedController');
var logger = require('../../logger');

let product_code="ugiqvzwih020yk8x5hfr";
exceedController.scanProductWS(product_code,function (err,result) {
    if(err)
    {
        logger.error("scanProductWS Error", err);
    }
    else
    {
        logger.info("scanProductWS Product Code", result);
    }
});
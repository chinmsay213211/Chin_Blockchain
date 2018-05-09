const express = require('express'),
    RBAC = require('rbac').default,
    secure = require('rbac/controllers/express'),
    logger = require('../../logger');


// your custom controller for express
function adminController(req, res, next) {
    res.send('Hello admin');
}

/**
 *
 * admin            - has to everything
 * account_manager  - has everything except delete
 * sales_manager    - can view, edit
 * driver           - can view
 * forklift_operator- can view
 *
 */

const app = express();
const rbac = new RBAC({
    roles: ['admin', 'forklift_operator', 'driver', 'account_manager', 'sales_manager', 'guest'],
    /*permissions: {
        // user: ['create', 'delete'],
        // password: ['change', 'forgot'],
        // article: ['create'],
        // rbac: ['update']
        qrcode: ['generate'],
        mainpage: ['view']
    },
    grants: {
        guest: ['forgot_password'],
        account_manager: ['change_password'],
        admin: ['*'],
        forklift_operator: [''],
        sales_manager: []
    }*/
}, (err, rbac) => {
    if (err) throw err;

    // setup express routes
    app.use('/admin', secure.hasRole(rbac, 'admin'), adminController);
});

app.listen(4444);
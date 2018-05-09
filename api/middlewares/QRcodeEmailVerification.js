const randomstring = require("randomstring"),
	nodemailer = require('nodemailer'),
    path = require('path'),
    config = require('config'),
    logger = require('../../logger');

const loggerName = "[QRcodeEmailVerification]: ";

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: config.email.username,
        pass: config.email.password
    }
});

exports.QRcodeEmailVerification = function(user, base64img) {

    let first_name = user.first_name,
        last_name = user.last_name,
        user_email = user.email;

    // setup email data with unicode symbols
    let mailOptions = {
        from: 'noreply@blockgemini.com',
        to: user_email, // list of receivers
        subject: 'QR-code verification', // Subject line
        html: 'Hello <strong>&nbsp;</br>' + first_name + ' ' + last_name + '<div> <img src="cid:random"/></div>',
        attachments: [{
            filename: 'image.png',
            //path: '/path/to/file',
            content: new Buffer(base64img, 'base64'),
            cid: 'random' //same cid value as in the html img src
        }]
    };

    // send mail with defined transport object
    // todo: guarantee work
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return logger.debug(loggerName, error);
        }
        logger.info(loggerName, 'Message sent successfully');

        // shut down the connection pool, no more messages
        // transporter.close();
    });
};

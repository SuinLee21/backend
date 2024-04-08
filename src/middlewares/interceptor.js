const interceptor = require('express-interceptor');
const logging = require("../modules/logging");
const requestIp = require('request-ip');

const intercept = interceptor((req, res) => ({
    isInterceptable: () => true,
    intercept: (body, send) => {
        if (req.idx) {
            console.log('logging');
            logging(req.iss, requestIp.getClientIp(req), req.api, req.body, body);
        }
        send(body);
    }
}))

module.exports = intercept;
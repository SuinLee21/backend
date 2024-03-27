const jwt = require("jsonwebtoken");
const getCurrentDate = require(".//getCurrentDate");
require('dotenv').config();

const logJwt = (db, token, userIp, api, jwtReq, result) => {
    const jwtData = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    console.log(jwtData);

    db.collection("logging").insertOne(
        {
            "iss": jwtData.iss,
            "userIp": userIp,
            "api": api,
            "res": jwtReq,
            "result": result,
            "request_time": getCurrentDate()
        }
    )
}

module.exports = logJwt
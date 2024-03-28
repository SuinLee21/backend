const jwt = require("jsonwebtoken");
const getCurrentDate = require(".//getCurrentDate");
const connectMongoDB = require("../../database/connect/mongodb");
require('dotenv').config();

const logJwt = async (token, userIp, api, reqBody, result) => {
    const jwtData = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    const db = await connectMongoDB();
    console.log(jwtData);

    db.collection("logging").insertOne(
        {
            "iss": jwtData.iss,
            "userIp": userIp,
            "api": api,
            "reqBody": reqBody,
            "result": result,
            "request_time": getCurrentDate()
        }
    )
}

module.exports = logJwt
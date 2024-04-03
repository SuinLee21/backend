const getCurrentDate = require(".//getCurrentDate");
const connectMongoDB = require("../../database/connect/mongodb");
require('dotenv').config();

const logJwt = async (userId, userIp, api, reqBody, result) => {
    const obj = {
        "iss": userId,
        "userIp": userIp,
        "api": api,
        "reqBody": reqBody,
        "result": result,
        "request_time": getCurrentDate()
    }
    const db = await connectMongoDB();

    db.collection("logging").insertOne(obj);
}

module.exports = logJwt
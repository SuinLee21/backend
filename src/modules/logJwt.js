const jwt = require("jsonwebtoken");
const getCurrentDate = require(".//getCurrentDate");
const connectMongoDB = require("../../database/connect/mongodb");
require('dotenv').config();

const logJwt = async (token, userIp, api, reqBody, result) => {
    const obj = {
        "iss": "",
        "userIp": userIp,
        "api": api,
        "reqBody": reqBody,
        "result": result,
        "request_time": getCurrentDate()
    }
    const db = await connectMongoDB();

    try {
        const jwtData = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
        console.log(jwtData);

        obj.iss = jwtData.iss;

        db.collection("logging").insertOne(obj);
    } catch (err) {
        //login api에서 예외 처리
        if (err.message === "jwt must be provided") {
            obj.iss = "Not a user";
            db.collection("logging").insertOne(obj);
        }
    }
}

module.exports = logJwt
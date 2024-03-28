const jwt = require("jsonwebtoken");
require('dotenv').config();

const checkLogin = (req, res, next) => {
    // const { token } = req.headers;
    const token = null;
    const result = {
        "success": false,
        "message": ""
    }

    try {
        const jwtData = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
        console.log(jwtData);
        next();
    } catch (err) {
        console.log("err는 : " + err);
        if (err.message === "jwt must be provided") {
            result.message = "로그인이 필요합니다.";
        } else if (err.message === "jwt expired") {
            result.message = "세션이 만료되었습니다. 다시 로그인해주세요.";
        } else if (err.message === "invalid token") {
            result.message = "정상적이지 않은 접근입니다.";
        } else {
            result.message = err.message;
        }

        res.send(result);
    }
}

module.exports = checkLogin
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const requestIp = require('request-ip');

const psql = require("../../database/connect/postgre");
// const mariadb = require("../../database/connect/mariadb");

const checkValidity = require("../middlewares/checkValidity");
const checkLogin = require("../middlewares/checkLogin");

const permission = require("../modules/permission");
const logJwt = require("../modules/logJwt");

//회원탈퇴
router.delete("/", checkLogin, async (req, res) => {
    const { token } = req.headers;
    const jwtData = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    const result = {
        "success": false,
        "message": ""
    };

    try {
        await psql.query(`
            DELETE FROM backend.user
            WHERE idx=$1
        `, [jwtData.idx]);

        result.success = true;
        result.message = "회원탈퇴가 되었습니다.";
        logJwt(token, requestIp.getClientIp(req), "DELETE/users", req.body, result)
        // req.session.destroy();
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

//특정 유저 정보 보기
router.get("/", checkLogin, async (req, res) => {
    const { token } = req.headers;
    const jwtData = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        const userData = await psql.query(`
            SELECT * FROM backend.user
            WHERE idx=$1
        `, [jwtData.idx]);

        if (userData.rows.length === 0) {
            throw new Error('존재하지 않는 정보입니다.');
        }

        result.success = true;
        result.message = "정상적으로 데이터를 불러왔습니다.";
        result.data = userData.rows;
        logJwt(token, requestIp.getClientIp(req), "GET/users", req.body, result)
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

//유저 정보 보기
router.get("/:idx", checkLogin, async (req, res) => {
    const userIdx = req.params.idx;
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        const userData = await psql.query(`
            SELECT id, name, phone_num FROM backend.user
            WHERE idx=$1
        `, [userIdx]);

        if (userData.rows.length === 0) {
            throw new Error('존재하지 않는 정보입니다.');
        }

        result.success = true;
        result.message = "정상적으로 데이터를 불러왔습니다.";
        result.data = userData.rows;
        logJwt(token, requestIp.getClientIp(req), `GET/users/${userIdx}`, req.body, result)
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

//특정 유저 정보 수정
router.put("/", checkLogin, checkValidity, async (req, res) => {
    const { userPw, userName, userPhoneNum } = req.body;
    let { token } = req.headers;
    const jwtData = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    const result = {
        "success": false,
        "message": "",
        "data": {
            "token": ""
        }
    };

    try {
        await psql.query(`
            UPDATE backend.user SET pw=$1, name=$2, phone_num=$3
            WHERE idx=$4
        `, [userPw, userName, userPhoneNum, jwtData.idx]);

        token = jwt.sign(
            {
                "iss": jwtData.iss,
                "idx": jwtData.idx,
                "name": userName,
            },
            process.env.TOKEN_SECRET_KEY,
            {
                "expiresIn": "5m"
            }
        )

        result.success = true;
        result.message = "내 정보가 수정되었습니다.";
        result.data.token = token;
        logJwt(token, requestIp.getClientIp(req), "PUT/users", req.body, result)
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

module.exports = router;
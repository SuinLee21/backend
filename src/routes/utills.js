const router = require("express").Router();
const jwt = require("jsonwebtoken");
const requestIp = require('request-ip');

const psql = require("../../database/connect/postgre");
const mariadb = require("../../database/connect/mariadb");
const connectMongoDB = require("../../database/connect/mongodb");

const checkValidity = require("../middlewares/checkValidity");
const checkLogin = require("../middlewares/checkValidity");

const permission = require("../modules/permission");
const logJwt = require("../modules/logJwt");

router.get('/', async (req, res) => {
    const result = {
        "success": false,
        "message": "",
        "data": null
    }

    try {
        const postData = await psql.query(`
            SELECT * FROM backend.comment
        `);
        // const postData = await mariadb.query(sql);

        // const postData = await new Promise((resolve, reject) => {
        //     mariadb.query(sql, (err, rows) => {
        //         resolve(rows);
        //     })
        // })

        // console.log(postData.result);

        // if (postData.rows.length === 0) {
        //     throw new Error('게시글이 존재하지 않습니다.');
        // }

        result.success = true;
        result.message = "정상적으로 데이터를 불러왔습니다.";
        result.data = postData;
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

//로그인
router.post("/login", checkValidity, async (req, res) => {
    const { userId, userPw } = req.body;
    const result = {
        "success": false,
        "message": "",
        "data": {
            "token": ""
        }
    };

    try {
        const userData = await psql.query(`
            SELECT * FROM backend.user
            WHERE id=$1 AND pw=$2
        `, [userId, userPw]);

        if (userData.rows.length === 0) {
            throw new Error('회원정보가 일치하지 않습니다.');
        }

        const token = jwt.sign(
            {
                "iss": userId,
                "idx": userData.rows[0].idx,
                "name": userData.rows[0].name,
            },
            process.env.TOKEN_SECRET_KEY,
            {
                "expiresIn": "5m"
            }
        )
        result.success = true;
        result.message = "로그인 성공.";
        result.data.token = token;
        logJwt(token, requestIp.getClientIp(req), "POST/login", req.body, result);
    } catch (err) {
        console.log(err.message);
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

//회원가입
router.post("/signup", checkValidity, async (req, res) => {
    const { userId, userPw, userName, userPhoneNum } = req.body;
    const result = {
        "success": false,
        "message": ""
    };

    try {
        await psql.query(`
            INSERT INTO backend.user(id, pw, name, phone_num)
            VALUES($1, $2, $3, $4)
        `, [userId, userPw, userName, userPhoneNum]);

        result.success = true;
        result.message = "정상적으로 가입되었습니다.";
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

//로그아웃
router.get("/logout", checkLogin, (req, res) => {
    const { token } = req.headers;
    const result = {
        "success": false,
        "message": ""
    };

    try {
        result.success = true;
        result.message = "로그아웃 되었습니다.";
        logJwt(token, requestIp.getClientIp(req), "GET/logout", req.body, result)
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

//아이디 찾기 // 수정
router.get("/users-id", checkValidity, async (req, res) => {
    const { userName, userPhoneNum } = req.query;
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        const userData = await psql.query(`
            SELECT * FROM backend.user
            WHERE name=$1 AND phone_num=$2
        `, [userName, userPhoneNum]);

        if (userData.rows.length === 0) {
            throw new Error('회원정보가 일치하지 않습니다.');
        }

        result.success = true;
        result.message = "아이디 찾기 성공.";
        result.data = userData.rows[0].id;
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

//비밀번호 찾기
router.post("/users-pw", checkValidity, async (req, res) => {
    const { userId, userName, userPhoneNum } = req.body;
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        const userData = await psql.query(`
            SELECT * FROM backend.user
            WHERE id=$1 AND name=$2 AND phone_num=$3
        `, [userId, userName, userPhoneNum]);

        if (userData.rows.length === 0) {
            throw new Error('회원정보가 일치하지 않습니다.');
        }

        result.success = true;
        result.message = "비밀번호 찾기 성공.";
        result.data = userData.rows[0].pw;
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

//알림 불러오기
router.get("/notifs", checkLogin, async (req, res) => {
    const { token } = req.headers;
    const jwtData = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    const result = {
        "success": false,
        "message": "",
        "data": null
    }

    try {
        const db = await connectMongoDB();

        const notifData = await db.collection("notif").find(
            {
                "receiver_idx": jwtData.idx
            }
        ).sort({ "created_at": -1 }).toArray();

        result.success = true;
        result.message = "정상적으로 알림들을 불러왔습니다.";
        result.data = notifData;
        logJwt(token, requestIp.getClientIp(req), "GET/logout", req.body, result)
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

module.exports = router;
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const redis = require("redis").createClient();

const psql = require("../../database/connect/postgre");
const mariadb = require("../../database/connect/mariadb");
const connectMongoDB = require("../../database/connect/mongodb");

const checkAuth = require("../middlewares/checkAuth");
const checkValidity = require("../middlewares/checkValidity");

const permission = require("../modules/permission");

//로그인
router.post("/login", checkValidity, async (req, res) => {
    const { userId, userPw } = req.body;
    const result = {
        "success": false,
        "message": "",
        "data": {
            "token": "",
            "recentUser": null
        }
    };
    let isAdmin = false;
    let token = null;
    req.api = "POST/login";

    try {
        const userData = await psql.query(`
            SELECT * FROM backend.user
            WHERE id=$1 AND pw=$2
        `, [userId, userPw]);

        if (userData.rows.length === 0) {
            throw new Error('회원정보가 일치하지 않습니다.');
        }

        isAdmin = userData.rows[0].is_admin;
        const userIdx = userData.rows[0].idx;
        const userName = userData.rows[0].name;

        token = jwt.sign(
            {
                "iss": userId,
                "idx": userIdx,
                "name": userName,
                "admin": isAdmin
            },
            process.env.TOKEN_SECRET_KEY,
            {
                "expiresIn": "25m"
            }
        );

        req.iss = userId;
        req.idx = userIdx;
        req.name = userName;

        //redis
        await redis.connect();

        await redis.zAdd('recentUser', { score: Date.now(), value: userId });
        const recentUser = await redis.zRange('recentUser', 0, -1);

        const todayLoginCount = await redis.hGet('todayLoginCount', 'count');
        if (todayLoginCount) {
            await redis.hSet('todayLoginCount', 'count', parseInt(todayLoginCount) + 1);
        } else {
            await redis.hSet('todayLoginCount', 'count', 1);
        }

        if (recentUser.length > 5) {
            recentUser.shift();
        }

        result.success = true;
        result.message = "로그인 성공.";
        result.data.token = token;
        result.data.recentUser = recentUser;
    } catch (err) {
        // console.log(err.message);
        console.log(err);
        result.message = err.message;
    } finally {
        redis.disconnect();
        res.send(result);
    }
});

//회원가입
router.post("/signup", checkValidity, async (req, res) => {
    const { userId, userPw, userName, userPhoneNum, isAdmin } = req.body;
    const result = {
        "success": false,
        "message": ""
    };

    try {
        await psql.query(`
            INSERT INTO backend.user(id, pw, name, phone_num, is_admin)
            VALUES($1, $2, $3, $4, $5)
        `, [userId, userPw, userName, userPhoneNum, isAdmin]);

        result.success = true;
        result.message = "정상적으로 가입되었습니다.";
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

//로그아웃
router.get("/logout", checkAuth(), (req, res) => {
    let { token } = req.headers;
    const result = {
        "success": false,
        "message": "",
        "data": {
            "token": ""
        }
    };
    req.api = "GET/logout";

    try {
        token = jwt.sign(
            {
                "iss": req.iss,
                "idx": req.idx,
                "name": req.name
            },
            process.env.TOKEN_SECRET_KEY,
            {
                "expiresIn": 1
            }
        )

        result.success = true;
        result.message = "로그아웃 되었습니다.";
        result.data.token = token;
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
router.get("/notifs", checkAuth(), async (req, res) => {
    const result = {
        "success": false,
        "message": "",
        "data": null
    }
    req.api = "GET/notifs";

    try {
        const db = await connectMongoDB();

        const notifData = await db.collection("notif").find(
            {
                "receiver_idx": req.idx
            }
        ).sort({ "created_at": -1 }).toArray();

        result.success = true;
        result.message = "정상적으로 알림들을 불러왔습니다.";
        result.data = notifData;
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

//관리자 권한으로 logging 보기
router.get("/logging", checkAuth("admin"), async (req, res) => {
    const result = {
        "success": false,
        "message": "",
        "data": []
    }
    req.api = "GET/logging";

    try {
        const db = await connectMongoDB();

        const loggingData = await db.collection("logging").find().sort({ "request_time": -1 }).toArray();

        result.success = true;
        result.message = "정상적으로 로깅들을 불러왔습니다.";
        result.data = loggingData;
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

router.get("/login-count", checkAuth(), async (req, res) => {
    const result = {
        "success": false,
        "message": "",
        "data": {
            "loginCount": 0
        }
    }
    req.api = "GET/login-count";

    try {
        await redis.connect();

        const loginCount = await redis.hGet('todayLoginCount', 'count');

        result.success = true;
        result.message = "정상적으로 데이터를 불러왔습니다.";
        result.data.loginCount = parseInt(loginCount);
    } catch (err) {
        result.message = err.message;
    } finally {
        redis.disconnect();
        res.send(result);
    }
})

module.exports = router;
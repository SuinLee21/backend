const router = require("express").Router();
const mariadb = require("../../database/connect/mariadb");
const modules = require("../module");

router.get('/', async (req, res) => {
    const sql = "SELECT * FROM post";
    const result = {
        "success": false,
        "message": "",
        "data": null
    }

    try {
        const post = await modules.query(sql);

        if (!post) {
            throw new Error('데이터를 불러오지 못 했습니다.');
        }

        result.success = true;
        result.message = "정상적으로 데이터를 불러왔습니다.";
        result.data = post
        console.log(post[0]);
    } catch (e) {
        result.message = e.message;
    } finally {
        res.send(result);
    }
})

//로그인
router.post("/login", modules.checkValidity, (req, res) => {
    const { userId, userPw } = req.body;
    const sql = "SELECT * FROM user WHERE id=? AND pw=?";
    const params = [userId, userPw];
    const result = {
        "success": false,
        "message": ""
    };

    try {
        mariadb.query(sql, params, (err, rows) => {
            if (err) {
                throw new Error(err);
            }
            if (!rows) {
                throw new Error("데이터를 불러오지 못 했습니다.");
            }

            // 일치 여부 확인
            if (rows[0].id !== userId || rows[0].pw !== userPw) {
                throw new Error("회원 정보가 일치하지 않습니다.");
            }

            result.success = true;
            result.message = "로그인 성공.";
            req.session.idx = rows[0].idx;

            res.send(result);
        })
    } catch (e) {
        result.message = e.message;
        res.send(result);
    }
});

//회원가입
router.post("/signup", modules.checkValidity, (req, res) => {
    const { userId, userPw, userName, userPhoneNum } = req.body;
    const sql = "INSERT INTO user(id, pw, name, phoneNum) VALUES(?, ?, ?, ?)";
    const params = [userId, userPw, userName, userPhoneNum];
    const result = {
        "success": false,
        "message": ""
    };

    try {
        mariadb.query(sql, params, (err, rows) => {
            if (err) {
                throw new Error(err);
            }

            result.success = true;
            result.message = "정상적으로 가입되었습니다.";

            res.send(result);
        })
    } catch (e) {
        result.message = e.message;
        res.send(result);
    }
});

//로그아웃
router.get("/logout", (req, res) => {
    // req.session.idx = 1;
    console.log(req.session.idx);
    const result = {
        "success": false,
        "message": ""
    };
    console.log(req.session.idx);

    try {
        if (!req.session.idx) {
            console.log(req.session.idx);
            throw new Error("접근 권한이 없습니다.");
        }

        req.session.destroy();
        result.success = true;
        result.message = "로그아웃 되었습니다.";

        res.send(result);
    } catch (e) {
        result.message = e.message.message;
        res.send(result);
    }
});

//아이디 찾기 // 수정
router.get("/users-id", modules.checkValidity, (req, res) => {
    const { userName, userPhoneNum } = req.query;
    const sql = "SELECT * FROM user WHERE name=? AND phoneNum=?";
    const params = [userName, userPhoneNum];
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        mariadb.query(sql, params, (err, rows) => {
            if (err) {
                throw new Error(err);
            } else {
                // 일치 여부 확인
                if (rows[0].name !== userName || rows[0].phoneNum !== userPhoneNum) {
                    throw new Error("회원 정보가 일치하지 않습니다.");
                } else {
                    result.success = true;
                    result.message = "아이디 찾기 성공.";
                    result.data = rows[0].id;
                }
            }
        })
    } catch (e) {
        result.message = e.message;
    } finally {
        res.send(result);
    }
});

//비밀번호 찾기
router.post("/users-password", modules.checkValidity, (req, res) => {
    const { userId, userName, userPhoneNum } = req.body;
    const sql = "SELECT * FROM user WHERE id=? AND name=? AND phoneNum=?";
    const params = [userId, userName, userPhoneNum];
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        mariadb.query(sql, params, (err, rows) => {
            if (err) {
                throw new Error(err);
            } else {
                // 일치 여부 확인
                if (rows[0].id !== userId || rows[0].name !== userName || rows[0].phoneNum !== userPhoneNum) {
                    throw new Error("회원 정보가 일치하지 않습니다.");
                } else {
                    result.success = true;
                    result.message = "비밀번호 찾기 성공.";
                    result.data = rows[0].pw;
                }
            }
        })
    } catch (e) {
        result.message = e.message;
    } finally {
        res.send(result);
    }
});

module.exports = router;
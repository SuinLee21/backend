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
        const postData = await modules.query(sql);

        if (postData.length === 0) {
            throw new Error('게시글이 존재하지 않습니다.');
        }

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
router.post("/login", modules.checkValidity, async (req, res) => {
    const { userId, userPw } = req.body;
    const sql = "SELECT * FROM user WHERE id=? AND pw=?";
    const params = [userId, userPw];
    const result = {
        "success": false,
        "message": ""
    };

    try {
        const userData = await modules.query(sql, params);

        if (userData.length === 0) {
            throw new Error('회원정보가 일치하지 않습니다.');
        }

        result.success = true;
        result.message = "로그인 성공.";
        result.data = userData;
        req.session.idx = userData[0].idx;
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

//회원가입
router.post("/signup", modules.checkValidity, async (req, res) => {
    const { userId, userPw, userName, userPhoneNum } = req.body;
    const sql = "INSERT INTO user(id, pw, name, phoneNum) VALUES(?, ?, ?, ?)";
    const params = [userId, userPw, userName, userPhoneNum];
    const result = {
        "success": false,
        "message": ""
    };

    try {
        await modules.query(sql, params);

        result.success = true;
        result.message = "정상적으로 가입되었습니다.";
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

//로그아웃
router.get("/logout", (req, res) => {
    const result = {
        "success": false,
        "message": ""
    };

    try {
        if (!req.session.idx) {
            throw new Error("접근 권한이 없습니다.");
        }

        req.session.destroy();
        result.success = true;
        result.message = "로그아웃 되었습니다.";
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

//아이디 찾기 // 수정
router.get("/users-id", modules.checkValidity, async (req, res) => {
    const { userName, userPhoneNum } = req.query; //다른 query 가 들어가면? 미들웨어 실행은?
    const sql = "SELECT * FROM user WHERE name=? AND phoneNum=?";
    const params = [userName, userPhoneNum];
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        const userData = await modules.query(sql, params);

        if (userData.length === 0) {
            throw new Error('회원정보가 일치하지 않습니다.');
        }

        result.success = true;
        result.message = "아이디 찾기 성공.";
        result.data = userData[0].id;
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

//비밀번호 찾기
router.post("/users-pw", modules.checkValidity, async (req, res) => {
    const { userId, userName, userPhoneNum } = req.body;
    const sql = "SELECT * FROM user WHERE id=? AND name=? AND phoneNum=?";
    const params = [userId, userName, userPhoneNum];
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        const userData = await modules.query(sql, params);

        if (userData.length === 0) {
            throw new Error('회원정보가 일치하지 않습니다.');
        }

        result.success = true;
        result.message = "비밀번호 찾기 성공.";
        result.data = userData[0].pw;
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

module.exports = router;
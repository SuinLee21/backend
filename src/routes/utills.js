const router = require("express").Router();
const psql = require("../../database/connect/postgre");
const mariadb = require("../../database/connect/mariadb");
const modules = require("../module");

router.get('/', async (req, res) => {
    const sql = "SELECT * FROM backend.user";
    const result = {
        "success": false,
        "message": "",
        "data": null
    }

    try {
        const postData = await psql.query(sql);

        if (postData.rows.length === 0) {
            throw new Error('게시글이 존재하지 않습니다.');
        }

        result.success = true;
        result.message = "정상적으로 데이터를 불러왔습니다.";
        result.data = postData.rows;
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

//로그인
router.post("/login", modules.checkValidity, async (req, res) => {
    const { userId, userPw } = req.body;
    const sql = "SELECT * FROM backend.user WHERE id=$1 AND pw=$2";
    const params = [userId, userPw];
    const result = {
        "success": false,
        "message": ""
    };

    try {
        const userData = await psql.query(sql, params);

        if (userData.rows.length === 0) {
            throw new Error('회원정보가 일치하지 않습니다.');
        }

        result.success = true;
        result.message = "로그인 성공.";
        req.session.idx = userData.rows[0].idx;
    } catch (err) {
        console.log(err.message);
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

//회원가입
router.post("/signup", modules.checkValidity, async (req, res) => {
    const { userId, userPw, userName, userPhoneNum } = req.body;
    const sql = "INSERT INTO backend.user(id, pw, name, phone_num) VALUES($1, $2, $3, $4)";
    const params = [userId, userPw, userName, userPhoneNum];
    const result = {
        "success": false,
        "message": ""
    };

    try {
        await psql.query(sql, params);

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
    const { userName, userPhoneNum } = req.query;
    const sql = "SELECT * FROM backend.user WHERE name=$1 AND phone_num=$2";
    const params = [userName, userPhoneNum];
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        const userData = await psql.query(sql, params);

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
router.post("/users-pw", modules.checkValidity, async (req, res) => {
    const { userId, userName, userPhoneNum } = req.body;
    const sql = "SELECT * FROM backend.user WHERE id=$1 AND name=$2 AND phone_num=$3";
    const params = [userId, userName, userPhoneNum];
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        const userData = await psql.query(sql, params);

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

module.exports = router;
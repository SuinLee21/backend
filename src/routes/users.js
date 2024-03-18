const router = require("express").Router();
const psql = require("../../database/connect/postgre");
// const mariadb = require("../../database/connect/mariadb");
const modules = require("../module");

//회원탈퇴
router.delete("/", async (req, res) => {
    const userIdx = req.session.idx;
    const result = {
        "success": false,
        "message": ""
    };

    try {
        if (!userIdx) {
            throw new Error("접근 권한이 없습니다.");
        }

        await psql.query(`
            DELETE FROM backend.user
            WHERE idx=$1
        `, [userIdx]);

        result.success = true;
        result.message = "회원탈퇴가 되었습니다.";
        req.session.destroy();
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

//특정 유저 정보 보기
router.get("/", async (req, res) => {
    const userIdx = req.session.idx;
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        if (!userIdx) {
            throw new Error("접근 권한이 없습니다.");
        }

        const userData = await psql.query(`
            SELECT * FROM backend.user
            WHERE idx=$1
        `, [userIdx]);

        if (userData.rows.length === 0) {
            throw new Error('존재하지 않는 정보입니다.');
        }

        result.success = true;
        result.message = "정상적으로 데이터를 불러왔습니다.";
        result.data = userData.rows;
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

//유저 정보 보기
router.get("/:idx", async (req, res) => {
    const userIdx = req.params.idx;
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        if (!userIdx) {
            throw new Error("접근 권한이 없습니다.");
        }

        const userData = await psql.query(`
            SELECT name, phone_num FROM backend.user
            WHERE idx=$1
        `, [userIdx]);

        if (userData.rows.length === 0) {
            throw new Error('존재하지 않는 정보입니다.');
        }

        result.success = true;
        result.message = "정상적으로 데이터를 불러왔습니다.";
        result.data = userData.rows;
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

//특정 유저 정보 수정
router.put("/", modules.checkValidity, async (req, res) => {
    const { userPw, userName, userPhoneNum } = req.body;
    const userIdx = req.session.idx;
    const result = {
        "success": false,
        "message": ""
    };

    try {
        if (!userIdx) {
            throw new Error("접근 권한이 없습니다.");
        }

        await psql.query(`
            UPDATE backend.user SET pw=$1, name=$2, phone_num=$3
            WHERE idx=$4
        `, [userPw, userName, userPhoneNum, userIdx]);

        result.success = true;
        result.message = "내 정보가 수정되었습니다.";
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

module.exports = router;
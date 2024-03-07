const router = require("express").Router();
const psql = require("../../database/connect/postgre");
// const mariadb = require("../../database/connect/mariadb");
const modules = require("../module");

//회원탈퇴
router.delete("/:idx", async (req, res) => {
    const userIdx = req.params.idx;
    const sql = "DELETE FROM user WHERE idx=?";
    const params = [userIdx];
    const result = {
        "success": false,
        "message": ""
    };

    try {
        if (req.session.idx !== userIdx) {
            throw new Error("접근 권한이 없습니다.");
        }

        await modules.query(sql, params);

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
router.get("/:idx", async (req, res) => {
    const userIdx = req.params.idx;
    const sql = "SELECT * FROM user WHERE idx=?";
    const params = [userIdx];
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        if (req.session.idx !== userIdx) {
            throw new Error("접근 권한이 없습니다.");
        }

        const userData = await modules.query(sql, params);

        if (userData.length === 0) {
            throw new Error('존재하지 않는 정보입니다.');
        }

        result.success = true;
        result.message = "정상적으로 데이터를 불러왔습니다.";
        result.data = userData;
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

//특정 유저 정보 수정
router.put("/:idx", modules.checkValidity, async (req, res) => {
    const { userPw, userName, userPhoneNum } = req.body;
    const userIdx = req.params.idx;
    const sql = "UPDATE user SET pw=?, name=?, phoneNum=? WHERE idx=?";
    const params = [userPw, userName, userPhoneNum, userIdx];
    const result = {
        "success": false,
        "message": ""
    };

    try {
        if (req.session.idx !== userIdx) {
            throw new Error("접근 권한이 없습니다.");
        }

        await modules.query(sql, params);

        result.success = true;
        result.message = "내 정보가 수정되었습니다.";
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

module.exports = router;
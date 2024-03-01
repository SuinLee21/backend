const router = require("express").Router();
const mariadb = require("../../database/connect/mariadb");
const modules = require("../module");

//회원탈퇴
router.delete("/:idx", (req, res) => {
    const userIdx = req.params.idx;
    const sql = "Delete FROM user WHERE idx=?";
    const params = [userIdx];
    const result = {
        "success": false,
        "message": ""
    };

    try {
        if (req.session.idx !== userIdx) {
            throw new Error("접근 권한이 없습니다.");
        } else {
            mariadb.query(sql, params, (err, rows) => {
                if (err) {
                    throw new Error(err);
                } else {
                    result.success = true;
                    result.message = "회원탈퇴가 되었습니다.";
                    req.session.destroy();
                }
            })
        }
    } catch (e) {
        result.message = e;
    } finally {
        res.send(result);
    }
});

//내 정보 보기
router.get("/:idx", (req, res) => {
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
        } else {
            mariadb.query(sql, params, (err, rows) => {
                if (err) {
                    throw new Error(err);
                } else {
                    result.success = true;
                    result.message = "정상 작동.";
                    result.data = rows;
                }
            })
        }
    } catch (e) {
        result.message = e;
    } finally {
        res.send(result);
    }
});

//내 정보 수정
router.put("/:idx", modules.checkValidity, (req, res) => {
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
        } else {
            mariadb.query(sql, params, (err, rows) => {
                if (err) {
                    throw new Error(err);
                } else {
                    result.success = true;
                    result.message = "내 정보가 수정되었습니다.";
                }
            })
        }
    } catch (e) {
        result.message = e;
    } finally {
        res.send(result);
    }
})

module.exports = router;
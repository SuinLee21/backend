const router = require("express").Router();
const mariadb = require("../../database/connect/mariadb");

const checkValidity = (req, res, next) => {
    const regexId = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,12}$/; //영어+숫자, 각 최소 1개 이상 8~12
    const regexPw = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,16}$/; //영어+숫자, 각 최소 1개 이상 8~16
    const regexName = /^[가-힣]{2,10}$/ //한글만 2~10;
    const regexPhoneNum = /^010-\d{4}-\d{4}$/;

    const { userId, userPw, userName, userPhoneNum } = req.body;
    const result = {
        "message": ""
    };

    if (userId) {
        if (!regexId.test(userId)) {
            result.message = "아이디를 다시 입력해주세요";
            res.send(result);
        }
    }
    if (userPw) {
        if (!regexPw.test(userPw)) {
            result.message = "비밀번호를 다시 입력해주세요";
            res.send(result);
        }
    }
    if (userName) {
        if (!regexName.test(userName)) {
            result.message = "이름을 다시 입력해주세요";
            res.send(result);
        }
    }
    if (userPhoneNum) {
        if (!regexPhoneNum.test(userPhoneNum)) {
            result.message = "전화번호를 다시 입력해주세요";
            res.send(result);
        }
    }

    next();
}

//회원탈퇴
router.delete("/:idx", (req, res) => {
    const idx = req.params.idx;
    const sql = "Delete FROM user WHERE idx=?";
    const params = [idx];
    const result = {
        "success": false,
        "message": ""
    };

    try {
        if (req.session.idx !== idx) {
            throw new Error("접근 권한이 없습니다.");
        } else {
            mariadb.query(sql, params, (err, rows) => {
                if (err) {
                    throw new Error(err);
                } else {
                    result.success = true;
                    result.message = "회원탈퇴가 되었습니다.";
                }
            })
        }
    } catch (e) {
        result.message = e;
    } finally {
        res.send(result);
    }
});

//내 정보 보기.
router.get("/:idx", (req, res) => {
    const idx = req.params.idx;
    const sql = "SELECT * FROM user WHERE idx=?";
    const params = [idx];
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        if (req.session.idx !== idx) {
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
router.put("/:idx", checkValidity, (req, res) => {
    const { userPw, userName, userPhoneNum } = req.body;
    const idx = req.params.idx;
    const sql = "UPDATE user SET pw=?, name=?, phoneNum=? WHERE idx=?";
    const params = [userPw, userName, userPhoneNum, idx];
    const result = {
        "success": false,
        "message": ""
    };

    try {
        if (req.session.idx !== idx) {
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
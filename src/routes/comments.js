const router = require("express").Router();
const mariadb = require("../../database/connect/mariadb");

//댓글 부르기

//댓글 작성
router.post("/comments", (req, res) => {
    const { postIdx, contents } = req.body;
    const userIdx = req.session.idx;
    const sql = "INSERT INTO comment(user_idx, post_idx, contents) VALUES(?, ?, ?)";
    const params = [userIdx, postIdx, contents];
    const result = {
        "success": false,
        "message": ""
    };

    try {
        if (!userIdx) {
            throw new Error("접근 권한이 없습니다.");
        } else {
            mariadb.query(sql, params, (err, rows) => {
                if (err) {
                    throw new Error(err);
                } else {
                    result.success = true;
                    result.message = "댓글이 작성되었습니다.";
                }
            })
        }
    } catch (e) {
        result.message = e;
    } finally {
        res.send(result);
    }
})

//댓글 수정
router.put("/comments/:idx", (req, res) => {
    const { userIdx, postIdx, contents } = req.body;
    const commentIdx = req.params.idx;
    const sql = "UPDATE comment SET contents=? WHERE idx=?";
    const params = [contents, commentIdx];
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
                    result.message = "댓글이 수정되었습니다.";
                }
            })
        }
    } catch (e) {
        result.message = e;
    } finally {
        res.send(result);
    }
})

//댓글 삭제
router.delete("/comments/:idx", (req, res) => {
    const { userIdx } = req.body;
    const idx = req.params.idx;
    const sql = "Delete FROM comment WHERE idx=?";
    const params = [idx];
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
                    result.message = "댓글이 삭제되었습니다.";
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
const router = require("express").Router();
const mariadb = require("../../database/connect/mariadb");

//게시글 전체 불러오기

//게시글 읽기
router.get("/posts/:idx", (req, res) => {
    const idx = req.params.idx;
    const sql = "SELECT * FROM post WHERE idx=?";
    const params = [idx];
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        if (!req.session.idx) {
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
})

//게시글 작성
router.post("/posts", (req, res) => {
    const { title, contents } = req.body;
    const idx = req.session.idx;
    const sql = "INSERT INTO post(user_idx, title, contents) VALUES(?, ?, ?)";
    const params = [idx, title, contents];
    const result = {
        "success": false,
        "message": ""
    };

    try {
        if (!idx) {
            throw new Error("접근 권한이 없습니다.");
        } else {
            mariadb.query(sql, params, (err, rows) => {
                if (err) {
                    throw new Error(err);
                } else {
                    result.success = true;
                    result.message = "정상 작동.";
                }
            })
        }
    } catch (e) {
        result.message = e;
    } finally {
        res.send(result);
    }
})

//게시글 수정
router.put("/posts/:idx", (req, res) => {
    const { title, contents } = req.body;
    const idx = req.params.idx;
    const sql = "UPDATE post SET title=?, contents=? WHERE user_idx=?";
    const params = [title, contents, idx];
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

//게시글 삭제
router.delete("/posts/:idx", (req, res) => {
    const idx = req.params.idx;
    const sql = "Delete FROM post WHERE user_idx=?";
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
                    result.message = "게시글이 삭제되었습니다.";
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
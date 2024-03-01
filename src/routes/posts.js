const router = require("express").Router();
const mariadb = require("../../database/connect/mariadb");

//게시글 전체 불러오기


//게시글 읽기
router.get("/posts/:idx", (req, res) => {
    const postIdx = req.params.idx;
    let sql = "SELECT * FROM post WHERE idx=?";
    let params = [postIdx];
    const result = {
        "success": false,
        "message": "",
        "postData": null,
        "commentData": null
    };

    try {
        if (!req.session.idx) {
            throw new Error("접근 권한이 없습니다.");
        } else {
            mariadb.query(sql, params, (err, rows) => {
                if (err) {
                    throw new Error(err);
                } else {
                    result.message = "게시글 읽기 성공";
                    result.postData = rows;

                    sql = "SELECT * FROM comment WHERE post_idx=?";
                    params = [postIdx];

                    mariadb.query(sql, params, (err, rows) => {
                        if (err) {
                            throw new Error(err);
                        } else {
                            result.message = "게시글, 댓글 읽기 성공";
                            result.commentData = rows;
                        }
                    })
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
    const userIdx = req.session.idx;
    const sql = "INSERT INTO post(user_idx, title, contents) VALUES(?, ?, ?)";
    const params = [userIdx, title, contents];
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
                    result.message = "게시글이 작성되었습니다.";
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
    const { userIdx, title, contents } = req.body;
    const postIdx = req.params.idx;
    const sql = "UPDATE post SET title=?, contents=? WHERE idx=?";
    const params = [title, contents, postIdx];
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

//게시글 삭제
router.delete("/posts/:idx", (req, res) => {
    const { userIdx } = req.body;
    const postIdx = req.params.idx;
    const sql = "Delete FROM post WHERE idx=?";
    const params = [postIdx];
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
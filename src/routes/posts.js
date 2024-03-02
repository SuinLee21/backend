const router = require("express").Router();
const mariadb = require("../../database/connect/mariadb");
const modules = require("../module");

//게시글 작성
router.post("/", async (req, res) => {
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
        }

        await modules.query(sql, params);

        result.success = true;
        result.message = "게시글이 작성되었습니다.";
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

//게시글 읽기
router.get("/:idx", async (req, res) => {
    const postIdx = req.params.idx;
    let sql = "SELECT * FROM post WHERE idx=?";
    const params = [postIdx];
    const result = {
        "success": false,
        "message": "",
        "postData": null,
        "commentData": null
    };

    try {
        if (!req.session.idx) {
            throw new Error("접근 권한이 없습니다.");
        }

        const postData = await modules.query(sql, params);

        if (postData.length === 0) {
            throw new Error('해당 게시글이 존재하지 않습니다.');
        }

        result.message = "게시글 읽기 성공";
        result.postData = postData;

        sql = "SELECT * FROM comment WHERE post_idx=?";

        const commentData = await modules.query(sql, params);

        if (commentData.length === 0) {
            throw new Error('댓글이 존재하지 않습니다.');
        }

        result.success = true;
        result.message = "게시글, 댓글 읽기 성공";
        result.commentData = commentData;
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

//게시글 수정
router.put("/:idx", async (req, res) => {
    const { userIdx, title, contents } = req.body; //userIdx를 body로 받아오는 게 맞을까?
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
        }

        await modules.query(sql, params);

        result.success = true;
        result.message = "게시글이 수정되었습니다.";
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

//게시글 삭제
router.delete("/:idx", async (req, res) => {
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
        }

        await modules.query(sql, params);

        result.success = true;
        result.message = "게시글이 삭제되었습니다.";
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

module.exports = router;
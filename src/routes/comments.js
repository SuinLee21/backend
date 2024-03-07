const router = require("express").Router();
const psql = require("../../database/connect/postgre");
// const mariadb = require("../../database/connect/mariadb");
const modules = require("../module");

//댓글 작성
router.post("/", async (req, res) => {
    const { postIdx, contents } = req.body;
    const userIdx = req.session.idx;
    const sql = `
        INSERT INTO backend.comment(user_idx, post_idx, contents)
        VALUES($1, $2, $3)
    `;
    const params = [userIdx, postIdx, contents];
    const result = {
        "success": false,
        "message": ""
    };

    try {
        if (!userIdx) {
            throw new Error("접근 권한이 없습니다.");
        }

        await psql.query(sql, params);

        result.success = true;
        result.message = "댓글이 작성되었습니다.";
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

//모든 댓글 읽기
router.get('/', async (req, res) => {
    const sql = "SELECT * FROM backend.comment";
    const result = {
        "success": false,
        "message": "",
        "data": null
    }

    try {
        const commentData = await psql.query(sql);

        if (commentData.rows.length === 0) {
            throw new Error('댓글이 존재하지 않습니다.');
        }

        result.success = true;
        result.message = "정상적으로 데이터를 불러왔습니다.";
        result.data = commentData.rows;
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

//댓글 수정
router.put("/:idx", async (req, res) => {
    const { contents } = req.body;
    const commentIdx = req.params.idx;
    const userIdx = req.session.idx;
    const sql = "UPDATE backend.comment SET contents=$1 WHERE idx=$2 AND user_idx=$3";
    const params = [contents, commentIdx, userIdx];
    const result = {
        "success": false,
        "message": ""
    };

    try {
        if (!userIdx) {
            throw new Error("접근 권한이 없습니다.");
        }

        await psql.query(sql, params);

        result.success = true;
        result.message = "댓글이 수정되었습니다.";
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

//댓글 삭제
router.delete("/:idx", async (req, res) => {
    const userIdx = req.session.idx;
    const commentIdx = req.params.idx;
    const sql = "Delete FROM backend.comment WHERE idx=$1 AND user_idx=$2";
    const params = [commentIdx, userIdx];
    const result = {
        "success": false,
        "message": ""
    };

    try {
        if (!userIdx) {
            throw new Error("접근 권한이 없습니다.");
        }

        await psql.query(sql, params);

        result.success = true;
        result.message = "댓글이 삭제되었습니다.";
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

module.exports = router;
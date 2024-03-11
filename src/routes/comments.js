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
    const sql = "DELETE FROM backend.comment WHERE idx=$1 AND user_idx=$2";
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

//특정 댓글 좋아요
router.post("/like", async (req, res) => {
    const { commentIdx } = req.body;
    const userIdx = req.session.idx;
    let sql = "SELECT * FROM backend.comment_like WHERE user_idx=$1 AND comment_idx=$2";
    let params = [userIdx, commentIdx];
    const result = {
        "success": false,
        "message": ""
    };

    try {
        if (!userIdx) {
            throw new Error("접근 권한이 없습니다.");
        }

        // 이미 좋아요가 눌려져 있는지 확인
        const commentLikeData = await psql.query(sql, params);

        if (commentLikeData.rows.length !== 0) {
            throw new Error('이미 좋아요가 눌러져 있습니다.');
        }

        //게시글 좋아요
        sql = `
            INSERT INTO backend.comment_like(user_idx, comment_idx)
            VALUES($1, $2)
        `;
        await psql.query(sql, params);

        result.message = "좋아요 정상 작동.";

        //게시글 좋아요 갯수 업데이트
        sql = "UPDATE backend.comment SET like_count=like_count+1 WHERE idx=$1 AND user_idx=$2";
        params = [commentIdx, userIdx];

        await psql.query(sql, params);

        result.success = true;
        result.message = "좋아요, 업데이트 정상 작동.";
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

//좋아요 취소 //pathparmeter??
router.delete("/:idx/like", async (req, res) => {
    const userIdx = req.session.idx;
    const commentIdx = req.params.idx;
    let sql = "Delete FROM backend.comment_like WHERE comment_idx=$1 AND user_idx=$2";
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

        result.message = "좋아요 삭제 완료.";

        sql = "UPDATE backend.comment SET like_count=like_count-1 WHERE idx=$1 AND user_idx=$2";
        params = [commentIdx, userIdx];

        await psql.query(sql, params);

        result.success = true;
        result.message = "좋아요가 취소되었습니다.";
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

module.exports = router;
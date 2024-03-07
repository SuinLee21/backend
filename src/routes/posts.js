const router = require("express").Router();
const psql = require("../../database/connect/postgre");
// const mariadb = require("../../database/connect/mariadb");
const modules = require("../module");

//게시글 작성
router.post("/", async (req, res) => {
    const { title, contents, category } = req.body;
    const userIdx = req.session.idx;
    const sql = "INSERT INTO backend.post(user_idx, title, contents, category) VALUES($1, $2, $3, $4)";
    const params = [userIdx, title, contents, category];
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
        result.message = "게시글이 작성되었습니다.";
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

//모든 게시글 읽기
router.get('/', async (req, res) => {
    const sql = "SELECT * FROM backend.post";
    const result = {
        "success": false,
        "message": "",
        "data": null
    }

    try {
        const postData = await psql.query(sql);

        if (postData.rows.length === 0) {
            throw new Error('게시글이 존재하지 않습니다.');
        }

        result.success = true;
        result.message = "정상적으로 데이터를 불러왔습니다.";
        result.data = postData.rows;
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

//특정 게시글 읽기
router.get("/:idx", async (req, res) => {
    const postIdx = req.params.idx;
    const sql = "SELECT * FROM backend.post WHERE idx=$1";
    const params = [postIdx];
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        if (!req.session.idx) {
            throw new Error("접근 권한이 없습니다.");
        }

        const postData = await psql.query(sql, params);

        if (postData.rows.length === 0) {
            throw new Error('해당 게시글이 존재하지 않습니다.');
        }

        result.success = true;
        result.message = "정상적으로 데이터를 불러왔습니다.";
        result.data = postData.rows;
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

//특정 카테고리 게시글 전체 읽기
router.get("/:category", async (req, res) => {
    const category = req.params.category;
    const sql = "SELECT * FROM backend.post WHERE category=$1";
    const params = [category];
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        if (!req.session.idx) {
            throw new Error("접근 권한이 없습니다.");
        }

        const postData = await psql.query(sql, params);

        if (postData.rows.length === 0) {
            throw new Error('해당 게시글이 존재하지 않습니다.');
        }

        result.success = true;
        result.message = "정상적으로 데이터를 불러왔습니다.";
        result.data = postData.rows;
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

//특정 게시글 댓글 읽기  //여기가 맞을까??
router.get('/:idx/comments', async (req, res) => {
    const postIdx = req.params.idx;
    const sql = "SELECT * FROM backend.comment WHERE post_idx=$1";
    const params = [postIdx];
    const result = {
        "success": false,
        "message": "",
        "data": null
    }

    try {
        const commentData = await psql.query(sql, params);

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

//게시글 수정
router.put("/:idx", async (req, res) => {
    const { title, contents, category } = req.body;
    const userIdx = req.session.idx;
    const postIdx = req.params.idx;
    const sql = `
        UPDATE backend.post
        SET title=$1, contents=$2, category=$3
        WHERE idx=$4 AND user_idx=$5
    `;
    const params = [title, contents, category, postIdx, userIdx];
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
        result.message = "게시글이 수정되었습니다.";
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

//게시글 삭제
router.delete("/:idx", async (req, res) => {
    const userIdx = req.session.idx;
    const postIdx = req.params.idx;
    const sql = "Delete FROM backend.post WHERE idx=$1 AND user_idx=$2";
    const params = [postIdx, userIdx];
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
        result.message = "게시글이 삭제되었습니다.";
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

//특정 게시글 좋아요  //pathparmeter??
router.post("/like", async (req, res) => {
    const { postIdx } = req.body;
    const userIdx = req.session.idx;
    let sql = "SELECT * FROM backend.post_like WHERE user_idx=$1 AND post_idx=$2";
    let params = [userIdx, postIdx];
    const result = {
        "success": false,
        "message": ""
    };
    let postLikeCount = 0;

    try {
        if (!userIdx) {
            throw new Error("접근 권한이 없습니다.");
        }

        // 이미 좋아요가 눌려져 있는지 확인
        let postLikeData = await psql.query(sql, params);

        if (postLikeData.rows.length !== 0) {
            throw new Error('이미 좋아요가 눌러져 있습니다.');
        }

        //게시글 좋아요
        sql = `
            INSERT INTO backend.post_like(user_idx, post_idx)
            VALUES($1, $2)
        `;
        await psql.query(sql, params);

        //특정 게시글 좋아요 갯수 불러오기
        sql = "SELECT * FROM backend.post_like WHERE post_idx=$1";
        params = [postIdx];

        postLikeData = await psql.query(sql, params);

        postLikeCount = postLikeData.rows.length;

        result.message = "좋아요 정상 작동.";

        //게시글 좋아요 갯수 업데이트
        sql = "UPDATE backend.post SET like_count=$1 WHERE idx=$2 AND user_idx=$3";
        params = [postLikeCount, postIdx, userIdx];

        await psql.query(sql, params);

        result.success = true;
        result.message = "좋아요, 업데이트 정상 작동.";
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

//좋아요 취소
router.delete("/:idx/like", async (req, res) => {
    const userIdx = req.session.idx;
    const postIdx = req.params.idx;
    const sql = "Delete FROM backend.post_like WHERE post_idx=$1 AND user_idx=$2";
    const params = [postIdx, userIdx];
    const result = {
        "success": false,
        "message": ""
    };

    try {
        if (!userIdx) {
            throw new Error("접근 권한이 없습니다.");
        }

        //굳이 데이터 있는지 확인해야 되나??

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
const router = require("express").Router();
const psql = require("../../database/connect/postgre");
// const mariadb = require("../../database/connect/mariadb");
const modules = require("../module");

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

//게시글 작성
router.post("/", async (req, res) => {
    const { title, contents, category } = req.body;
    const userIdx = req.session.idx;
    const sql = "INSERT INTO backend.post(user_idx, title, contents, category) VALUES($1, $2, $3, $4)";
    const params = [1, title, contents, category];
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
    const params = [postIdx, 1];
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

module.exports = router;
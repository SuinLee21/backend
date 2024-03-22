const router = require("express").Router();
const psql = require("../../database/connect/postgre");
// const mariadb = require("../../database/connect/mariadb");
const modules = require("../module");
const connectMongoDB = require("../../database/connect/mongodb");

//게시글 작성
router.post("/", async (req, res) => {
    const { title, contents, categoryIdx } = req.body;
    const userIdx = req.session.idx;
    const result = {
        "success": false,
        "message": ""
    };

    try {
        if (!userIdx) {
            throw new Error("접근 권한이 없습니다.");
        }

        await psql.query(`
            INSERT INTO backend.post(user_idx, category_idx, title, contents, like_count)
            VALUES($1, $2, $3, $4, 0)
        `, [userIdx, categoryIdx, title, contents]);

        const db = await connectMongoDB();

        //post 갯수 증가 후, post 갯수 저장.
        await db.collection("counter").updateOne({ "name": "counter" }, { $inc: { "post_count": 1 } });
        const counterData = await db.collection("counter").findOne({ "name": "counter" });
        const postCount = counterData.post_count;

        //collection("comment")에 새로 생성한 게시글 댓글란 만들기
        await db.collection("comment").insertOne(
            {
                "post_idx": postCount,
                "comment": {}
            }
        )

        //psql backend.user에서 세션에 저장된 idx를 제외하고 모두 가져오기
        const userIdxList = await psql.query(`
            SELECT idx FROM backend.user WHERE idx NOT IN($1)
        `, [userIdx]);

        //알림 collection에 추가
        for (let i = 0; i < userIdxList.rows.length; i++) {
            await db.collection("notif").insertOne(
                {
                    "post_idx": postCount,
                    "sender_name": req.session.userName,
                    "receiver_idx": userIdxList.rows[i].idx,
                    "type": "newPost"
                }
            )
        }

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
    const result = {
        "success": false,
        "message": "",
        "data": null
    }

    try {
        const postData = await psql.query(`
            SELECT * FROM backend.post
        `);

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
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        if (!req.session.idx) {
            throw new Error("접근 권한이 없습니다.");
        }

        const postData = await psql.query(`
            SELECT * FROM backend.post
            WHERE idx=$1
        `, [postIdx]);

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
router.get("/category/:idx", async (req, res) => {
    const categoryIdx = req.params.idx;
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        if (!req.session.idx) {
            throw new Error("접근 권한이 없습니다.");
        }

        const postData = await psql.query(`
            SELECT * FROM backend.post
            WHERE category_idx=$1
        `, [categoryIdx]);

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

//특정 게시글 댓글 읽기
router.get('/:idx/comments', async (req, res) => {
    const postIdx = parseInt(req.params.idx);
    const result = {
        "success": false,
        "message": "",
        "data": null
    }

    try {
        if (!req.session.idx) {
            throw new Error("접근 권한이 없습니다.");
        }

        const db = await connectMongoDB();

        const commentData = await db.collection("comment").findOne(
            {
                "post_idx": postIdx
            }
        )

        result.success = true;
        result.message = "정상적으로 데이터를 불러왔습니다.";
        result.data = commentData;
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

//게시글 수정
router.put("/:idx", async (req, res) => {
    const { title, contents, categoryIdx } = req.body;
    const userIdx = req.session.idx;
    const postIdx = req.params.idx;
    const result = {
        "success": false,
        "message": ""
    };

    try {
        if (!userIdx) {
            throw new Error("접근 권한이 없습니다.");
        }

        await psql.query(`
            UPDATE backend.post
            SET category_idx=$1, title=$2, contents=$3
            WHERE idx=$4 AND user_idx=$5
        `, [categoryIdx, title, contents, postIdx, userIdx]);

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
    const postIdx = parseInt(req.params.idx);
    const result = {
        "success": false,
        "message": ""
    };

    try {
        if (!userIdx) {
            throw new Error("접근 권한이 없습니다.");
        }

        const db = await connectMongoDB();
        await db.collection("comment").deleteOne(
            {
                "post_idx": postIdx
            }
        )

        await psql.query(`
            Delete FROM backend.post
            WHERE idx=$1 AND user_idx=$2
        `, [postIdx, userIdx]);

        result.success = true;
        result.message = "게시글이 삭제되었습니다.";
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

//특정 게시글 좋아요
router.post("/like", async (req, res) => {
    const postIdx = parseInt(req.body.postIdx);
    const userIdx = parseInt(req.session.idx);
    const result = {
        "success": false,
        "message": ""
    };

    try {
        if (!userIdx) {
            throw new Error("접근 권한이 없습니다.");
        }

        const db = await connectMongoDB();

        // 이미 좋아요가 눌려져 있는지 확인
        let postLikeData = await psql.query(`
            SELECT * FROM backend.post_like
            WHERE user_idx=$1 AND post_idx=$2
        `, [userIdx, postIdx]);

        if (postLikeData.rows.length !== 0) {
            throw new Error('이미 좋아요가 눌러져 있습니다.');
        }

        //게시글 좋아요
        await psql.query(`
            INSERT INTO backend.post_like(user_idx, post_idx)
            VALUES($1, $2)
        `, [userIdx, postIdx]);

        result.message = "좋아요 정상 작동.";

        //게시글 좋아요 갯수 업데이트
        await psql.query(`
            UPDATE backend.post SET like_count=like_count+1
            WHERE idx=$1
        `, [postIdx]);

        //게시글 작성자의 user_idx 가지고 오기
        const posterIdx = await psql.query(`
            SELECT user_idx FROM backend.post WHERE idx=$1
        `, [postIdx]);

        //알림 collection에 추가
        await db.collection("notif").insertOne(
            {
                "post_idx": postIdx,
                "sender_idx": userIdx,
                "sender_name": req.session.userName,
                "receiver_idx": posterIdx.rows[0].user_idx,
                "type": "postLike"
            }
        )

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
    const userIdx = parseInt(req.session.idx);
    const postIdx = parseInt(req.params.idx);
    const result = {
        "success": false,
        "message": ""
    };

    try {
        if (!userIdx) {
            throw new Error("접근 권한이 없습니다.");
        }

        const db = await connectMongoDB();

        await psql.query(`
            Delete FROM backend.post_like
            WHERE post_idx=$1 AND user_idx=$2
        `, [postIdx, userIdx]);

        result.message = "좋아요 삭제 완료.";

        //좋아요 갯수 업데이트
        await psql.query(`
            UPDATE backend.post SET like_count=like_count-1
            WHERE idx=$1
        `, [postIdx]);

        await db.collection("notif").deleteOne(
            {
                "post_idx": postIdx,
                "sender_idx": userIdx,
                "type": "postLike"
            }
        )

        result.success = true;
        result.message = "좋아요가 취소되었습니다.";
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

module.exports = router;
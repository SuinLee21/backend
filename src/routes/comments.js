const router = require("express").Router();
const psql = require("../../database/connect/postgre");
// const mariadb = require("../../database/connect/mariadb");
const modules = require("../module");
const connectMongoDB = require("../../database/connect/mongodb");

//댓글 작성
router.post("/", async (req, res) => {
    const { postIdx, contents, commentIdxList } = req.body;
    const userIdx = req.session.idx;
    const userName = req.session.name;
    const insertObj = {
        "user_idx": userIdx,
        "user_name": userName,
        "contents": contents,
        "comment": {}
    };
    const result = {
        "success": false,
        "message": ""
    };

    try {
        if (!userIdx) {
            throw new Error("접근 권한이 없습니다.");
        }

        const db = await connectMongoDB();

        //comment 갯수 증가 후, comment 갯수 저장.
        await db.collection("counter").updateOne({ "name": "counter" }, { $inc: { "comment_count": 1 } });
        const counterData = await db.collection("counter").findOne({ "name": "counter" });
        const comment_count = counterData.comment_count;

        //특정 게시글 댓글 모두 불러오기.
        const commentData = await db.collection("comment").findOne({ "post_idx": postIdx });
        //굳이 나눠야 할까?
        if (commentIdxList.length === 0) {
            commentData.comment[comment_count] = insertObj;
        } else {
            let tempObj = commentData;
            for (let i = 0; i < commentIdxList.length; i++) {
                tempObj = tempObj.comment[commentIdxList[i]];
            }
            tempObj.comment[comment_count] = insertObj;
        }
        //댓글 작성
        await db.collection("comment").updateOne(
            {
                "post_idx": postIdx
            },
            {
                $set: { "comment": commentData.comment }
            }
        )

        //게시글 user_idx와 user_name 가져오기
        const postUserData = await psql.query(`
            SELECT p.user_idx, u.name
            FROM backend.post p
            INNER JOIN backend.user u
            ON p.idx=$1 AND p.user_idx=u.idx
        `, [postIdx]);

        //알림 collection에 추가
        await db.collection("notif").insertOne(
            {
                "post_idx": postIdx,
                "sender_idx": userIdx,
                "sender_name": userName,
                "receiver_idx": postUserData.rows[0].user_idx,
                "receiver_name": postUserData.rows[0].name,
                "type": "newComment"
            }
        )

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
    const { postIdx, contents, commentIdxList } = req.body;
    const commentIdx = req.params.idx;
    const userIdx = req.session.idx;
    const result = {
        "success": false,
        "message": ""
    };

    try {
        if (!userIdx) {
            throw new Error("접근 권한이 없습니다.");
        }

        const db = await connectMongoDB();
        const commentData = await db.collection("comment").findOne({ "post_idx": postIdx });

        let tempObj = commentData;
        //commnetIdxList 가 수정하려는 댓글의 idx를 제외한, 부모 idx만 가지고 온다는 전제
        for (let i = 0; i < commentIdxList; i++) {
            tempObj = tempObj.comment[commentIdx[i]];
        }

        //수정 권한 체크
        if (tempObj.comment[commentIdx].user_idx != userIdx) {
            throw new Error("접근 권한이 없습니다.");
        }

        tempObj.comment[commentIdx].contents = contents;

        await db.collection("comment").updateOne(
            {
                "post_idx": postIdx
            },
            {
                $set: { "comment": commentData.comment }
            }
        )

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
    const { postIdx } = req.body;
    const userIdx = req.session.idx;
    const commentIdx = req.params.idx;
    const deleteMessage = "삭제된 댓글입니다.";
    const result = {
        "success": false,
        "message": ""
    };

    try {
        if (!userIdx) {
            throw new Error("접근 권한이 없습니다.");
        }

        const db = await connectMongoDB();
        const commentData = await db.collection("comment").findOne({ "post_idx": postIdx });

        let tempObj = commentData;
        //commnetIdxList 가 삭제하려는 댓글의 idx를 제외한, 부모 idx만 가지고 온다는 전제
        for (let i = 0; i < commentIdxList; i++) {
            tempObj = tempObj.comment[commentIdx[i]];
        }

        //삭제 권한 체크
        if (tempObj.comment[commentIdx].user_idx != userIdx) {
            throw new Error("접근 권한이 없습니다.");
        }

        tempObj.comment[commentIdx].contents = deleteMessage;

        await db.collection("comment").updateOne(
            {
                "post_idx": postIdx
            },
            {
                $set: { "comment": commentData.comment }
            }
        )

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
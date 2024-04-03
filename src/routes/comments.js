const router = require("express").Router();

const psql = require("../../database/connect/postgre");
// const mariadb = require("../../database/connect/mariadb");
const connectMongoDB = require("../../database/connect/mongodb");

const checkAuth = require("../middlewares/checkAuth");
const checkValidity = require("../middlewares/checkAuth");

const permission = require("../modules/permission");
const getCurrentDate = require("../modules/getCurrentDate");
const updateComment = require("../modules/updateComment");

//댓글 작성
router.post("/", checkAuth, checkValidity, async (req, res) => {
    const postIdx = parseInt(req.body.postIdx);
    const contents = req.body.contents;
    const commentIdxList = req.body.commentIdxList;

    const userIdx = req.idx;
    const insertObj = {
        "user_idx": userIdx,
        "contents": contents,
        "like_count": 0,
        "comment": {},
        "created_at": getCurrentDate()
    };
    const result = {
        "success": false,
        "message": ""
    };
    req.api = "POST/comments";

    try {
        const db = await connectMongoDB();

        //comment 갯수 증가 후, comment 갯수 저장.
        await db.collection("counter").updateOne({ "name": "counter" }, { $inc: { "comment_count": 1 } });
        const counterData = await db.collection("counter").findOne({ "name": "counter" });
        const commentCount = counterData.comment_count;

        //특정 게시글 댓글 모두 불러오기.
        const commentData = await db.collection("comment").findOne({ "post_idx": postIdx });

        //obj에 댓글 추가
        let tempObj = commentData;
        for (let i = 0; i < commentIdxList.length; i++) {
            tempObj = tempObj.comment[commentIdxList[i]];
        }
        tempObj.comment[commentCount] = insertObj;

        //댓글 작성
        await updateComment(db, postIdx, commentData.comment);

        //게시글 user_idx 가져오기
        const postUserData = await psql.query(`
            SELECT user_idx
            FROM backend.post
            WHERE idx=$1
        `, [postIdx]);

        const posterIdx = postUserData.rows[0].user_idx;
        //알림 collection에 추가
        if (posterIdx !== userIdx) {
            await db.collection("notif").insertOne(
                {
                    "post_idx": postIdx,
                    "sender_name": req.name,
                    "receiver_idx": posterIdx,
                    "type": "newComment",
                    "created_at": getCurrentDate()
                }
            )
        }

        result.success = true;
        result.message = "댓글이 작성되었습니다.";
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

//댓글 수정
router.put("/:idx", checkAuth, checkValidity, async (req, res) => {
    const postIdx = parseInt(req.body.postIdx);
    const contents = req.body.contents;
    const commentIdxList = req.body.commentIdxList;

    const commentIdx = parseInt(req.params.idx);
    const userIdx = req.idx;
    const result = {
        "success": false,
        "message": ""
    };
    req.api = `PUT/comments/${commentIdx}`;

    try {
        const db = await connectMongoDB();

        //댓글 정보 가져오기
        const commentData = await db.collection("comment").findOne({ "post_idx": postIdx });

        let tempObj = commentData;
        //commnetIdxList 가 수정하려는 댓글의 idx를 제외한, 부모 idx만 가지고 온다는 전제
        for (let i = 0; i < commentIdxList; i++) {
            tempObj = tempObj.comment[commentIdxList[i]];
        }

        //수정 권한 체크
        if (tempObj.comment[commentIdx].user_idx != userIdx) {
            throw new Error("수정 권한이 없습니다.");
        }

        tempObj.comment[commentIdx].contents = contents;

        await updateComment(db, postIdx, commentData.comment);

        result.success = true;
        result.message = "댓글이 수정되었습니다.";
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

//댓글 삭제
router.delete("/:idx", checkAuth, async (req, res) => {
    const postIdx = parseInt(req.body.postIdx);
    const commentIdxList = req.body.commentIdxList;

    const userIdx = req.idx;
    const commentIdx = parseInt(req.params.idx);
    const deleteMessage = "삭제된 댓글입니다.";
    const result = {
        "success": false,
        "message": ""
    };
    req.api = `DELETE/comments/${commentIdx}`;

    try {
        const db = await connectMongoDB();

        //댓글 정보 가져오기
        const commentData = await db.collection("comment").findOne({ "post_idx": postIdx });

        let tempObj = commentData;
        //commnetIdxList 가 삭제하려는 댓글의 idx를 제외한, 부모 idx만 가지고 온다는 전제
        for (let i = 0; i < commentIdxList; i++) {
            tempObj = tempObj.comment[commentIdxList[i]];
        }

        //삭제 권한 체크
        if (tempObj.comment[commentIdx].user_idx != userIdx) {
            throw new Error("삭제 권한이 없습니다.");
        }

        tempObj.comment[commentIdx].contents = deleteMessage;

        await updateComment(db, postIdx, commentData.comment);

        result.success = true;
        result.message = "댓글이 삭제되었습니다.";
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

//특정 댓글 좋아요
router.post("/like", checkAuth, async (req, res) => {
    const postIdx = parseInt(req.body.postIdx);
    const commentIdxList = req.body.commentIdxList; //수정하려는 idx도 list에 있다는 전제

    const userIdx = req.idx;
    const commentIdx = commentIdxList[commentIdxList.length - 1];
    const result = {
        "success": false,
        "message": ""
    };
    req.api = "POST/comments/like";

    try {
        const db = await connectMongoDB();

        // 이미 좋아요가 눌려져 있는지 확인
        const commentLikeData = await db.collection("comment_like").findOne(
            {
                "user_idx": userIdx,
                "comment_idx": commentIdx
            }
        )

        if (commentLikeData) {
            throw new Error("이미 좋아요가 눌러져 있습니다.");
        }

        //댓글 좋아요
        await db.collection("comment_like").insertOne(
            {
                "user_idx": userIdx,
                "comment_idx": commentIdx
            }
        )

        result.message = "좋아요 정상 작동.";

        //댓글 좋아요 갯수 업데이트
        const commentData = await db.collection("comment").findOne({ "post_idx": postIdx });
        let tempObj = commentData;
        for (let i = 0; i < commentIdxList.length - 1; i++) {
            tempObj = tempObj.comment[commentIdxList[i]];
        }

        tempObj.comment[commentIdx].like_count += 1;

        await updateComment(db, postIdx, commentData.comment);

        result.success = true;
        result.message = "좋아요, 업데이트 정상 작동.";
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

//좋아요 취소 //pathparmeter??
router.delete("/:idx/like", checkAuth, async (req, res) => {
    const postIdx = parseInt(req.body.postIdx);
    const commentIdxList = req.body.commentIdxList; //삭제하려는 idx는 포함하지 않는다는 전제

    const userIdx = req.idx;
    const commentIdx = parseInt(req.params.idx);
    const result = {
        "success": false,
        "message": ""
    };
    req.api = `DELETE/${commentIdx}/like`;

    try {
        const db = await connectMongoDB();

        // 이미 좋아요가 눌려져 있는지 확인
        const commentLikeData = await db.collection("comment_like").findOne(
            {
                "user_idx": userIdx,
                "comment_idx": commentIdx
            }
        )

        if (!commentLikeData) {
            throw new Error("좋아요가 없습니다.");
        }

        //댓글 좋아요 취소
        await db.collection("comment_like").deleteOne(
            {
                "user_idx": userIdx,
                "comment_idx": commentIdx
            }
        )

        result.message = "좋아요 정상 작동.";

        //댓글 좋아요 갯수 업데이트
        const commentData = await db.collection("comment").findOne({ "post_idx": postIdx });
        let tempObj = commentData;
        for (let i = 0; i < commentIdxList.length; i++) {
            tempObj = tempObj.comment[commentIdxList[i]];
        }

        tempObj.comment[commentIdx].like_count -= 1;

        await updateComment(db, postIdx, commentData.comment);


        result.success = true;
        result.message = "좋아요 취소, 업데이트 완료.";
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

module.exports = router;
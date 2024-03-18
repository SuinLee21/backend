const router = require("express").Router();
const client = require("mongodb").MongoClient;
const connectMongoDB = require("../../database/connect/mongodb");

router.post("/", async (req, res) => {
    const { author, message, comment } = req.body;

    const result = {
        "success": false,
        "message": "",
        "data": null
    }

    // let connect = null;

    try {
        // if (author === "" || author === undefined || author === null) {
        //     throw new Error("작성자 값 주셈")
        // }

        // if (message === "" || message === undefined || message === null) {
        //     throw new Error("채팅 값 주셈")
        // }

        const db = await connectMongoDB();

        const object = {
            "author": author,
            "message": message
        }

        const sender = "conan";

        // await db.collection("chat").insertOne({ "author": "temp1", "message": "노근본1" });

        // const data = await db.collection("notif").find({}).toArray();

        // for (let i = 0; i < data.length; i++) {
        //     await db.collection("notif").insertOne({ "sender": sender, "receiver": data[i].user, "type": "newPost" });
        // }
        const data1 = await db.collection("comment").findOne({ "post_idx": "5" });

        const obj = {
            "user_idx": 1,
            "contents": "업뎃 댓글임.",
            "comment": {}
        }

        // data1.comment[4].contents = "업데이트 테스트입니다.";

        // await db.collection("notif").updateOne({
        //     "post_idx": "2"
        // }, { $set: { "comments.1": data1.comments[1] } });

        // await db.collection("notif").updateOne({
        //     "post_idx": "2"
        // }, { $set: { "comments": data1.comments } });

        // data1.comment[4].comment[6].comment[1].contents = "삭제된 댓글입니다.";

        // await db.collection("comment").updateOne({
        //     "post_idx": "1"
        // }, {
        //     $set: { "comment": data1.comment }
        // });

        result.success = true;
        // result.data = data;
    } catch (err) {
        console.log(err);
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

module.exports = router;

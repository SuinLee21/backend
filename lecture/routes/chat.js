const router = require("express").Router();
const client = require("mongodb").MongoClient;
const connectMongoDB = require("../../database/connect/mongodb");

router.post("/", async (req, res) => {
    const { author, message, comment } = req.body;

    console.log(req.body);
    console.log(comment)
    console.log(comment[2]);
    console.log(comment.length);

    const result = {
        "success": false,
        "message": "",
        "data": null
    }

    // let connect = null;

    try {
        if (author === "" || author === undefined || author === null) {
            throw new Error("작성자 값 주셈")
        }

        if (message === "" || message === undefined || message === null) {
            throw new Error("채팅 값 주셈")
        }

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
        const data1 = await db.collection("notif").findOne({ "post_idx": "2" });

        const obj = {
            "user_idx": "2",
            "contents": "두 번째 댓글임.",
            "comments": {}
        }

        data1.comments[5] = obj;

        // data1.comments[1].comments[4] = obj;

        // await db.collection("notif").updateOne({
        //     "post_idx": "2"
        // }, { $set: { "comments.1": data1.comments[1] } });

        await db.collection("notif").updateOne({
            "post_idx": "2"
        }, { $set: { "comments": data1.comments } });

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

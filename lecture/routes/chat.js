const router = require("express").Router();
const client = require("mongodb").MongoClient;
const connectMongoDB = require("../../database/connect/mongodb");

router.post("/", async (req, res) => {
    const { author, message } = req.body;
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

        // await db.collection("chat").insertOne({ "author": "temp1", "message": "노근본1" });

        const data = await db.collection("chat").find({}).toArray();

        console.log(data);
        result.success = true;
        result.data = data;
    } catch (err) {
        console.log(err);
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

module.exports = router;

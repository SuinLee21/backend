const router = require("express").Router();
const { Client } = require("pg");

router.get("/", async (req, res) => {
    const { id } = req.body;
    const result = {
        "success": false,
        "message": "",
        "data": null
    }

    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'ubuntu',
        password: '1234',
        database: 'web'
    })

    //예외처리
    try {
        // if (idx === null || idx === undefined || idx === "") {
        //     throw new Error("idx 값이 존재하지 않습니다.");
        // }

        //db 통신
        await client.connect();
        const sql = "SELECT * FROM backend.account WHERE id=$1";
        const data = await client.query(sql, [id]);

        const row = data.rows; //읽어 온 값

        if (row.length === 0) {
            throw new Error("회원 정보가 존재하지 않아요.");
        }

        result.success = true;
        result.data = row;

        //db 결과 처리
    } catch (e) {
        console.log(e.message);
        result.message = e.message;
    } finally {
        if (client) {
            client.end(); //연결 가능한 connetion이 있어서 끊어줘야 함.
        }
        res.send(result);
    }
});

//post, put, delete;

//export 작업
module.exports = router;
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const https = require("https");

const app = express();
const port = 8000;
const sslPort = 8443;

require('dotenv').config();

// const mongodb = require("../database/connect/mongodb");
// const connect = await mongodb.connect();
// const db = connect.db('backend');

app.use(express.json());
app.use(cors());

const options = {
    "key": fs.readFileSync("/home/ubuntu/backend/ssl/key.pem"),
    "cert": fs.readFileSync("/home/ubuntu/backend/ssl/cert.pem"),
    // "ca":  /회사에서 발급하는 것임. 이거 없으면 ssl 동작 안 함
    "passphrase": "1234"
}

//redirect 설정 ( http로 접속을 했다면, https 쉡 서버로 흐름을 바꿔주는 기능 )

// app.get("*", (req, res, next) => {
//     const protocol = req.protocol  //http or https

//     if (protocol === "http") {
//         const dest = `https://${req.hostname}:${sslPort}${req.url}`
//         res.redirect(dest);
//     }
//     next();
// })

app.get("/mainpage", (req, res) => {
    res.sendFile(`${__dirname}/main1.html`)
})

app.post("/login", (req, res) => {
    const { id, pw } = req.body;
    const result = {
        "success": false
    }

    if (id === "suin" && pw === "suin") {
        result.success = true;
    }

    res.send(result);
})

const accoutApi = require("../lecture/routes/account");
app.use("/account", accoutApi);

const chatApi = require("../lecture/routes/chat");
app.use("/chat", chatApi);

app.listen(port, () => {
    console.log(`${port}번에서 HTTP Web Server 실행`);
});

// https.createServer(options, app).listen(sslPort, () => {
//     console.log(`${sslPort}번에서 HTTPs Web Server 실행`);
// });
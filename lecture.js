const express = require("express");
const cors = require("cors");

const app = express();
const port = 8000;

app.use(express.json());
app.use(cors());

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

const accoutApi = require("./src/routes/account")
app.use("/account", accoutApi);

app.listen(port, () => {
    console.log(`${port}번에서 HTTP Web Server 실행`);
}); 
const express = require("express"); //express.js를 import 한 것

const app = express();
const port = 8000;

//우리가 통신에서 json으로 값을 주고 받긴하지만, json은 원래 통신에 사용할 수 없는 자료구조임. json을 string으로 변환해서 보내고,
//받는 쪽은 이걸 json으로 변환해서 사용함.
app.use(express.json());

//api (파일을 반환하는 api)
app.get("/mainpage", (req, res) => {
    res.sendFile(`${__dirname}/main1.html`) //절대 경로 적어야 되는 데 __dirname으로 가능
})

//api (값을 반환하는 api)
app.post("/login", (req, res) => {
    const { id, pw } = req.body;
    const result = {
        "success": false
    }// 통신할 때는 obj

    //데이터베이스 통신
    if (id === "suin" && pw === "suin") {
        result.success = true;
    }

    //값 반환
    res.send(result);
})

app.listen(port, () => {
    console.log(`${port}번에서 HTTP Web Server 실행`);
}); //web server 실행 코드 //aws에서 8000을 막아서 이거를 풀어줘야 됨.
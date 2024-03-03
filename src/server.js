const express = require("express");
const session = require('express-session');

const usersApi = require("./routes/users");
const postsApi = require("./routes/posts");
const commentsApi = require("./routes/comments");
const utillsApi = require("./routes/utills");

const mariadb = require("../database/connect/mariadb");
mariadb.connect();

require('dotenv').config();
// const pg = require("../database/connect/postgre");
// pg.connect(err => {
//     if (err) {
//         console.log(err);
//     }
// })

const app = express();
const port = process.env.HTTP_PORT;
const maxAge = 30 * 60 * 1000;

app.use(express.json());
app.use(session({
    secret: 'SECRET_CODE',
    resave: false,
    saveUninitialized: false,
    checkPeriod: maxAge
}));

app.use("/users", usersApi);
app.use("/posts", postsApi);
app.use("/comments", commentsApi);
app.use("/", utillsApi);

app.listen(port, () => {
    console.log(`${port}번에서 HTTP Web Server 실행`);
});
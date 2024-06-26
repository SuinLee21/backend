const express = require("express");
const session = require('express-session');

const interceptor = require("./middlewares/interceptor");

const schedule = require("./modules/schedule");

const usersApi = require("./routes/users");
const postsApi = require("./routes/posts");
const commentsApi = require("./routes/comments");
const utillsApi = require("./routes/utills");
const authApi = require("./routes/auth")
const passport = require("passport");
require('../src/passport/kakaoStrategy')();

// const mariadb = require("../database/connect/mariadb");
// mariadb.connect();

require('dotenv').config();
const psql = require("../database/connect/postgre");
psql.connect(err => {
    if (err) {
        console.log(err);
    }
});

const app = express();
const port = process.env.HTTP_PORT;
const maxAge = 30 * 60 * 1000;


app.use(express.json());
app.use(express.static('public'));
app.use(session({
    secret: 'SECRET_CODE',
    resave: false,
    saveUninitialized: false,
    checkPeriod: maxAge
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.sendFile('/index.html')
})
app.use(interceptor);

app.use("/users", usersApi);
app.use("/posts", postsApi);
app.use("/comments", commentsApi);
app.use("/", utillsApi);
app.use("/oauth", authApi);

schedule;

app.listen(port, () => {
    console.log(`${port}번에서 HTTP Web Server 실행`);
});

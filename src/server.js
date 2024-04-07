const express = require("express");
const session = require('express-session');
const interceptor = require('express-interceptor');
const requestIp = require('request-ip');
const jwt = require('jsonwebtoken');
const schedule = require("node-schedule");
const redis = require("redis").createClient();

const usersApi = require("./routes/users");
const postsApi = require("./routes/posts");
const commentsApi = require("./routes/comments");
const utillsApi = require("./routes/utills");

const logging = require("./modules/logging");

// const mariadb = require("../database/connect/mariadb");
// mariadb.connect();

require('dotenv').config();
const pg = require("../database/connect/postgre");
pg.connect(err => {
    if (err) {
        console.log(err);
    }
});

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

app.use(interceptor((req, res) => ({
    isInterceptable: () => true,
    intercept: (body, send) => {
        if (req.idx) {
            console.log('logging');
            logging(req.iss, requestIp.getClientIp(req), req.api, req.body, body);
        }
        send(body);
    }
})));

app.use("/users", usersApi);
app.use("/posts", postsApi);
app.use("/comments", commentsApi);
app.use("/", utillsApi);

schedule.scheduleJob('0 0 0 * * *', async () => {
    try {
        await redis.connect();

        const todayLoginHistory = await redis.zRange('todayLoginHistory', 0, -1);

        for (let i = 0; i < todayLoginHistory.length; i++) {
            await redis.sAdd("totalLoginHistory", todayLoginHistory[i]);
        }
        await redis.zRemRangeByLex("todayLoginHistory", "-", "+");
    } catch (err) {
        console.log(err);
    } finally {
        redis.disconnect();
    }
});

app.listen(port, () => {
    console.log(`${port}번에서 HTTP Web Server 실행`);
});

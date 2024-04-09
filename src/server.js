const express = require("express");
const session = require('express-session');
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const interceptor = require("./middlewares/interceptor");

const schedule = require("./modules/schedule");

const usersApi = require("./routes/users");
const postsApi = require("./routes/posts");
const commentsApi = require("./routes/comments");
const utillsApi = require("./routes/utills");

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

app.use(interceptor);

app.use("/users", usersApi);
app.use("/posts", postsApi);
app.use("/comments", commentsApi);
app.use("/", utillsApi);

schedule;

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, done) {
            console.log(path.dirname(file.originalname));
            console.log(path.basename(file.originalname));
            console.log(path.extname(file.originalname));
            done(null, "public");
        },
        filename(req, file, done) {
            done(null, 'sadDog');
        }
    }),
    fileFilter(req, file, done) {
        if (fs.existsSync("public/dog2.jpg")) {
            console.log('exists');
            fs.unlinkSync("public/dog2.jpg");
            return done(('이미 존재하는 파일입니다.'), false);
        } else {
            console.log('not');
        }

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

        if (!allowedTypes.includes(file.mimetype)) {
            const error = new Error("허용되지 않는 파일 형식입니다");
            return done(error, false);
        }

        done(null, true);
    }
});

const uploadMiddleware = upload.single("image");

app.post("/upload", uploadMiddleware, (req, res) => {
    console.log(req.file);
    res.status(200).send("uploaded");
});

app.get("/test", (req, res) => {
    console.log('before');
    if (fs.existsSync("public/dog2.jpg")) {
        console.log('exits')
        // fs.unlinkSync("public/dog2.jpg");
    } else {
        console.log('not');
    }
    console.log('after')
    res.send(true);
})

app.listen(port, () => {
    console.log(`${port}번에서 HTTP Web Server 실행`);
});

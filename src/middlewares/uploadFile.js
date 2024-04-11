const path = require("path");
const multer = require("multer");
const fs = require("fs");

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, done) {
            done(null, "public/img");
        },
        filename(req, file, done) {
            const fileName = `${Date.now()}${path.extname(file.originalname)}`;
            req.imgPath = `img/${fileName}`;

            done(null, fileName);
        }
    }),
    fileFilter(req, file, done) {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

        if (!allowedTypes.includes(file.mimetype)) {
            return done('허용되지 않는 확장자입니다.', false);
        }

        done(null, true);
    }
});

const uploadMiddleware = upload.single("image");

module.exports = uploadMiddleware;
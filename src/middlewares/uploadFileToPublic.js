const path = require("path");
const multer = require("multer");

const checkFileType = require("../modules/checkFileType");

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
        checkFileType(file.mimetype);

        done(null, true);
    }
});

const uploadMiddleware = upload.single("image");

module.exports = uploadMiddleware;
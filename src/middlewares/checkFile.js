const checkFile = (req, res, next) => {
    const result = {
        "success": false,
        "message": ""
    }

    try {
        if (!req.file) {
            throw new Error('파일을 업로드 해주세요.');
        }
        next()
    } catch (err) {
        result.message = err.message;
        res.send(result);
    }
}

module.exports = checkFile;
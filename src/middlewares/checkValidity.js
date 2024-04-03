const checkValidity = (req, res, next) => {
    const regexId = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,12}$/; //영어+숫자, 각 최소 1개 이상 8~12
    const regexPw = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,16}$/; //영어+숫자, 각 최소 1개 이상 8~16
    const regexName = /^[가-힣]{2,10}$/ //한글만 2~10;
    const regexPhoneNum = /^010-\d{4}-\d{4}$/;

    const { userId, userPw, userName, userPhoneNum } = Object.keys(req.body).length == 0 ? req.query : req.body;
    let { title, contents } = req.body;
    const result = {
        "success": false,
        "message": ""
    };

    if (userId) {
        if (!regexId.test(userId)) {
            result.message = "아이디를 다시 입력해주세요";
            return res.status(404).send(result);
        }
    }
    if (userPw) {
        if (!regexPw.test(userPw)) {
            result.message = "비밀번호를 다시 입력해주세요";
            return res.status(404).send(result);
        }
    }
    if (userName) {
        if (!regexName.test(userName)) {
            result.message = "이름을 다시 입력해주세요";
            return res.status(404).send(result);
        }
    }
    if (userPhoneNum) {
        if (!regexPhoneNum.test(userPhoneNum)) {
            result.message = "전화번호를 다시 입력해주세요";
            return res.status(404).send(result);
        }
    }
    if (title) {
        title = title.replace(/\n|\r/g, '');
        console.log(title);
    }
    if (contents) {
        contents = contents.replace(/\n|\r/g, '');
    }
    next();
}

module.exports = checkValidity;
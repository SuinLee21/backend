const mariadb = require("../database/connect/mariadb");

module.exports = {
    query: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            mariadb.query(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                }

                resolve(rows);
            })
        })
    },

    checkValidity: (req, res, next) => {
        const regexId = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,12}$/; //영어+숫자, 각 최소 1개 이상 8~12
        const regexPw = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,16}$/; //영어+숫자, 각 최소 1개 이상 8~16
        const regexName = /^[가-힣]{2,10}$/ //한글만 2~10;
        const regexPhoneNum = /^010-\d{4}-\d{4}$/;

        const { userId, userPw, userName, userPhoneNum } = req.body;
        const result = {
            "message": ""
        };

        if (userId) {
            if (!regexId.test(userId)) {
                result.message = "아이디를 다시 입력해주세요";
                console.log('aa')
                return res.status(404).send(result);
            }
        }
        if (userPw) {
            if (!regexPw.test(userPw)) {
                result.message = "비밀번호를 다시 입력해주세요";
                return res.send(result);
            }
        }
        if (userName) {
            if (!regexName.test(userName)) {
                result.message = "이름을 다시 입력해주세요";
                return res.send(result);
            }
        }
        if (userPhoneNum) {
            if (!regexPhoneNum.test(userPhoneNum)) {
                result.message = "전화번호를 다시 입력해주세요";
                return res.send(result);
            }
        }
        next();
    }
}

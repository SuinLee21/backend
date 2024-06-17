const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;
const pool = require("../../database/connect/postgre");

module.exports = () => {
    passport.use(
        new KakaoStrategy(
            {
                clientID: process.env.KAKAO_ID, // 카카오 로그인에서 발급받은 REST API 키
                callbackURL: "/oauth/kakao/callback", // 카카오 로그인 Redirect URI 경로
            },

            async (accessToken, refreshToken, profile, done) => {
                console.log("kakao profile", profile);
                try {
                    const exUser = await pool.query(
                        `SELECT idx FROM backend.kakao WHERE nickname = $1`,
                        [profile.nickname]
                    );
                    // 이미 가입된 카카오 프로필이면 성공
                    if (exUser) {
                        done(null, exUser); // 로그인 인증 완료
                    } else {
                        // 가입되지 않는 유저면 회원가입 시키고 로그인을 시킨다
                        const newUser = await pool.query(
                            `INSERT INTO backend.kakao(nickname) VALUES($1)`,
                            [profile.nickname]
                        );
                        done(null, newUser); // 회원가입하고 로그인 인증 완료
                    }
                } catch (error) {
                    console.error(error);
                    done(error);
                }
            }
        )
    );
};

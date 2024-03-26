const permission = (sessionIdx) => {
    if (!sessionIdx) {
        throw new Error("접근 권한이 없습니다.");
    }
}

module.exports = permission;
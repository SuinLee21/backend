const checkFileType = (file) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (!allowedTypes.includes(file)) {
        return done('허용되지 않는 확장자입니다.', false);
    }
}
const updateComment = (db, postIdx, obj) => {
    db.collection("comment").updateOne(
        {
            "post_idx": postIdx
        },
        {
            $set: { "comment": obj }
        }
    )
}

module.exports = updateComment;
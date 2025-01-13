const mongoose = require('mongoose');


const blogSchema = mongoose.Schema({
    title : String,
    content : String,
    username : String,
    comments : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "comment"
        }
    ],
    likes : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "user"
        }
    ]
})

module.exports = mongoose.model("blog",blogSchema)
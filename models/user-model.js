const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/devSphere")

const userSchema = mongoose.Schema({

    fullname : String,
    email : String,
    password : String,
    username : String,
    blogs : [
        { 
            type : mongoose.Schema.Types.ObjectId,
             ref : "blog"
        }
    ],
    comments : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : "comment"
        }
    ],
    image : Buffer

})

module.exports = mongoose.model("user",userSchema)
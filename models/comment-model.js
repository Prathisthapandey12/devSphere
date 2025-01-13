const mongoose = require('mongoose');


const commentSchema = mongoose.Schema({
   
    content : String,
    username : String, 
})

module.exports = mongoose.model("comment",commentSchema)
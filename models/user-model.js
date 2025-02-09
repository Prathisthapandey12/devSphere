const mongoose = require('mongoose');


mongoose.connect("mongodb+srv://prathisthapandey10:SHREEradha@cluster0.k7hxy.mongodb.net/devSphere?retryWrites=true&w=majority")
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));


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
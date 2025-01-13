const express = require('express')
const path = require('path')

const session = require('express-session')
const passport = require('passport')
const {Strategy} = require('passport-local')
const bcrypt = require('bcrypt')

const app = express();


const userModel = require('./models/user-model')
const blogModel = require('./models/blog-model')
const commentModel = require('./models/comment-model')

app.use(session({
    secret : "TOP_SECRET",
    resave : false,
    saveUninitialized : true,
    cookie: {
        maxAge: 1000*60*60*24
    }
}))

app.use( passport.initialize() )
app.use( passport.session() )


app.use( express.json() );
app.use( express.urlencoded({extended: true}) );
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine','ejs');


app.get( '/' , function(req,res){

    res.render('login')
} )

app.get('/main', async function(req,res){

    if( req.isAuthenticated() ){
        let blogs = await blogModel.find().populate("comments")
        res.render('index',{blogs : blogs, user : req.user})
    }
    else{
        res.redirect('/')
    }
})

app.get('/comment/:blogid', async function(req,res){
   if( req.isAuthenticated() ){
        let user = await userModel.findOne({email : req.user.email})
        let blog = await blogModel.findOne({_id : req.params.blogid})
        let comment =await commentModel.create({
            content : req.query.comment,
            username : req.user.username
        })
        user.comments.push(comment._id)
        await user.save()
        blog.comments.push(comment._id)
        await blog.save()
        res.redirect('/main')
   
   }
})

app.get('/like/:blogid' , async function(req,res){
   if(req.isAuthenticated()){
        let user = await userModel.findOne({email : req.user.email})
        let blog = await blogModel.findOne({_id : req.params.blogid})
    
        let index = blog.likes.indexOf( user._id )
        if( index === -1 ){
            blog.likes.push(user._id)
            await blog.save()
     
        }
        else{
            blog.likes.splice(index,1)
            await blog.save()
        }
             
        res.redirect('/main')
   } 
})

app.get('/delete/:blogid', async function(req,res){
    if(req.isAuthenticated()){
        let user = await userModel.findOne({email : req.user.email})
        let blog = await blogModel.findOne({_id : req.params.blogid}).populate('comments')
        
        blog.comments.forEach( async function(comment){
           let u = await userModel.findOne({username : comment.username})
           var index = u.comments.indexOf(comment)
           u.comments.splice(index, 1)
           await user.save()
           await commentModel.findOneAndDelete({ _id : comment })
        } )

        await blogModel.findOneAndDelete( {_id : blog._id} )
        let index = user.blogs.indexOf( blog._id )
        user.blogs.splice(index,1)
        await user.save()
        res.redirect("/main")
    }
})


app.post('/login' , passport.authenticate("local" , {
    successRedirect: '/main',
    failureRedirect: "/"
}
))

app.post('/register',async function(req,res){

   let user = await userModel.findOne({email : req.body.email})
   if( user ){
    res.redirect('/')
   }
   else{
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(req.body.password, salt, async function(err, hash) {
            let user = await userModel.create({
                fullname: req.body.fullname,
                username : req.body.username,
                password: hash,
                email: req.body.email,
            })
            req.login(user, (err) => {
                console.log("success");
                res.redirect("/main");
              });
        });
    });
   }
})

app.post('/post', async function(req,res){
   
    let blog = await blogModel.create({
        title : req.body.title,
        content: req.body.content,
        username: req.user.username
    })

    let user = await userModel.findOne({email : req.user.email})
    user.blogs.push(blog._id)
    await user.save();
    res.redirect('/main') 
})




passport.use( new Strategy( async function verify(username , password , cb ){
    let user = await userModel.findOne({email : username})
    if( !user ){
       return cb(null,false)
    }
    else{
        bcrypt.compare(password,user.password, function(err,result){
            if(result)
            {  
               return cb(null,user)
            }
            else
                return cb(null,false)
        });
    }
} ))

passport.serializeUser((user,cb) => {
    cb(null,user)
})

passport.deserializeUser((user,cb) => {
    cb(null,user)
})

app.listen(3000)


const express = require("express");
const mongoose = require("mongoose");
const shortid = require("shortid")
const User = require("./user")
var db="mongodb+srv://ruslan-akhm:zuaGc0VJ@cluster0-y5h11.mongodb.net/test?retryWrites=true&w=majority"
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
var db = mongoose.connection;
//mongoose.set('useFindAndModify', false);
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(express.static("public"));
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

const endpoint1 = "/api/exercise/new-user"
const endpoint2 = "/api/exercise/add"

app.post(endpoint1,(req,res)=>{  //Post username first
  var username = req.body.user
  User.findOne({username:username},(err,user)=>{ //Check if username taken already
    if(err) return console.log(err);
    if(user==null){//If username not taken - create new username & id
      var newUser = new User({
        username: username,
        _id: shortid.generate()
      })
      newUser.save();
      var newId = newUser._id
      res.json({username:username, _id:newId})
    }
    else{
      res.send("username already taken")
    }
  })
})
app.post(endpoint2,(req,res)=>{
  var userId = req.body.id;
  var description = req.body.description;
  var duration = req.body.duration;
  var date = req.body.date|| new Date().toDateString();
  var update = {description:description,
                duration:duration,
                date:date};
  var updatedUser = User.findOneAndUpdate(
    {_id:userId},
    {new:true},
    (err,user)=>{
    if(err) return console.log(err);
    if(user==null){
      res.json("No user with this id found")
      return
    }
    user.log.push(update);
    user.count=user.log.length;
    user.save();
    res.json({"username":user.username, "_id":user._id, "description":description, "duration":duration, "date": date})
    return
  })
})

app.get("/api/exercise/log",(req,res)=>{
  var id = req.query.userId;
  var from = req.query.from;
  var to = req.query.to;
  var limit = req.query.limit
  //console.log('to = '+to);
  //console.log('from = '+from);
  //console.log('limit = '+limit);
  if(id!==undefined){
    
      User.findOne({_id:id},(err,user)=>{
      if (err) return console.log(err);
      if(user==null){
        res.json("No user with this id found")
        return
      }
      var filteredLog = user.log;
      var filteredCount = user.count; 
      if(from!==undefined){
        filteredLog = filteredLog.filter(logs=>{
          return logs.date>=from
        }) 
      }
      if(to!==undefined){
        filteredLog = filteredLog.filter(logs=>{
          return logs.date<to
        }) 
      }
      if(limit!==undefined){
        filteredLog.splice(limit, filteredLog.length)
      }
        filteredCount = filteredLog.length;
        //console.log(user)
      res.json({username:user.username, _id:user._id, count: filteredCount, log: filteredLog})
      return 
    })
  } 
})


const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log("Listening on port " + PORT);
});

const express = require('express')
const app = express()
require ('dotenv').config;
const cors = require('cors')
require('dotenv').config()
const { urlencoded } = require('body-parser');
const mongoose= require('mongoose');

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true}, {useUnifiedTopology: true});

let User;

const UserSchema= new mongoose.Schema({
  Username: String
});
User= mongoose.model("User", UserSchema, "Usercollection");
app.use(cors())
app.use(express.static('public'))
let absolutePath= __dirname + '/views/index.html';
app.get('/', (req, res) => {
  res.sendFile(absolutePath)
});

// let url={};
// let userid={};
// let counter=0;
app.use(express.urlencoded({extended:true}));
app.post('/api/users', async (req, res)=>{
  const user_name= req.body.username;
  const newUser= new User({
    Username: user_name
  });
  newUser.save()
  User.findOne({Username:user_name}, (err, data)=>{
    if (err){
      return done(err);
    }
    else{
      return res.json({"username": user_name, "id":newUser._id});
      
    }
  });
  
});

app.get("/api/users", (req,res)=>{
    User.find({},(err, data)=>{
    if (err){
      return done(err);
    }
    else{
      return res.json(data);
    }
  });
});

let Exercise;
const ExerciseSchema= new mongoose.Schema({
  Id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  },
  Description: String,
  Duration: Number,
  Date: {
    type:Date,
    default:Date.now
  }
});
Exercise= mongoose.model('Exercise', ExerciseSchema, "Exercisecollection");

app.post("/api/users/:_id/exercises", (req,res)=>{
  let id= mongoose.Types.ObjectId( req.params._id);
  let desc= req.body.description;
  let dur= req.body.duration;
  let date= req.body.date;

  

// const newExercise= new Exercise({
//     Id:id,
//     Description:desc,
//     Duration:dur,
//     Date:conv_date
//   });
//   let savedExercise;
//    newExercise.save((err, savedExercise) => {
//     if (err || !savedExercise) {
//       return res.json({ error: "could not save exercise" });
//     }
//   });
//   Exercise.findById(savedExercise._id).populate('Id','Username').exec((err, data)=>{
//     if (err){
//       return res.json({error: "could not find exercise"});
//     }
//     else{
//       return res.json({"id":data.Id._id,"username":data.Id.Username, "date": data.Date,"duration": data.Duration, "description": data.Description});
//     }
//   });
// });
 
User.findById(id, (err, user) => {
  if (err || !user) {
    return res.json({ error: "user not found" });
  }

  const newExercise = new Exercise({
    Id: user._id,
    Description: desc,
    Duration: dur,
    Date: date? new Date(date) : new Date()
  });
 
  newExercise.save((err, savedExercise) => {
    if (err || !savedExercise) {
      return res.json({ error: "could not save exercise" });
    }

    res.json({
      id: user._id, username: user.Username, description: savedExercise.Description, duration: savedExercise.Duration, date: savedExercise.Date.toDateString()
    });
  });
});
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

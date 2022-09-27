const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const User = require('./user');
const Exercise = require('./exercise');

require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) => {
  const {username} = req.body;
  const document = new User({
    username
  });
  document.save((error, data) => {
    if (error) res.json({error});
    res.json(data);
  })  
});

app.get('/api/users', async (req, res) => { 
  const users = await User.find();
  res.json(users);
});

app.post('/api/users/:_id/exercises', async (req, res) => {
  const { _id } = req.params;
  try {
    const user = await User.findById(_id);
    if (user){
      const { description, duration, date} = req.body;      
      let dateParameter = new Date();

      if (date){
        dateParameter = new Date(Date.parse(`${date}T00:00:00`));
      }

      if (dateParameter == 'Invalid Date'){
        return res.json({error: 'Invalid Date'});
      }
      
      const exercise = new Exercise({
        description, duration, date: dateParameter, username: user.username
      });
     
      const docExercise = await exercise.save();
      const {_doc:docUser} = user;

      res.json({
        username: docExercise.username,
        description: docExercise.description,
        duration: docExercise.duration,
        date: docExercise.date.toDateString(),
        _id: user._id
      });
    }else
    {
      res.status(404).json({error: 'user does not exists'});
    }
  } catch (error) {
    res.json({error: error.message})
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const { _id } = req.params;
    const { from, to, limit } = req.query;

    const user = await User.findById(_id);

    const gte = from || '1970-01-01';
    const lte = to || '2999-12-31';
    
    if (user){
      const rawExercises = await Exercise
        .find({username: user.username, date: { $gte: gte, $lte: lte }})     
        .limit(limit);
      const exercises = rawExercises.map(x => {
        const {description, duration, date} = x;
        return { description, duration, date: date.toDateString() }
      });
      const response = {
        username: user.username,
        _id: user._id,
        count: exercises.length,
        log: exercises
      }
      res.json(response);
    }
    else{
      res.status(404).json({error: 'user does not exists'});
    }
  } catch (error) {
    res.json({error: error.message});
  }
});

mongoose.connect(process.env.MONGO_URI, 
                 {
                   useNewUrlParser: true,
                   useUnifiedTopology: true
                 }).then(() => console.log('connected to db'))

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

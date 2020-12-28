const config = require('./config/config.json');
const keys = require('./config/keys.json');

//Dependencies
const express = require('express');
const mongoose = require('mongoose');
require('express-async-errors');    //Async error handling

//Dependencies

const app = express();

require('./config/app/viewengine')(app);

//For using POST method
app.use(express.urlencoded({
  extended: true
}));

//Connect to DB
mongoose.connect(keys.mongodb.dbURI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
}, function(err) {
  if (err) {
    console.log('Unable to connect to db');
    return;
  }

  console.log('Connected to DB successfully');
});

require('./config/app/routes')(app);

//Error handling: LAST
require('./config/app/errorhandler')(app);

app.listen(config.app.PORT, _ => {
  console.log(`App listening on PORT ${config.app.PORT}`)
});
const config = require('./config/config.json');
const dotenv = require('dotenv');
dotenv.config();

//Dependencies
const express = require('express');
const mongoose = require('mongoose');
const PORT = (process.env.PORT) ? process.env.PORT : config.app.PORT;
require('express-async-errors');    //Async error handling

//Dependencies

const app = express();

require('./config/app/viewengine')(app);

//For using POST method
app.use(express.urlencoded({
  extended: true
}));

//Connect to DB
mongoose.connect(process.env.dbURI, { 
  useCreateIndex: true,
  useNewUrlParser: true, 
  useUnifiedTopology: true 
}, function(err) {
  if (err) {
    console.log('Unable to connect to db');
    return;
  }

  console.log('Connected to DB successfully');
});

require('./config/app/session')(app);     //IMPORTANT: Init express session, before locals (locals uses session)
require('./middlewares/locals.mdw')(app); //IMPORTANT: Routes after locals

require('./config/app/routes')(app);    //Where all routes are

//Error handling: LAST
require('./config/app/errorhandler')(app);

app.listen(PORT, _ => {
  console.log(`App listening on PORT ${PORT}`)
});

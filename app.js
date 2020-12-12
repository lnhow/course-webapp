const config = require('./config/config.json')

//Dependencies
const express = require('express');
const exphbs = require('express-handlebars');

require('express-async-errors');    //Async error handling

//Dependencies

const app = express();

app.get('/', function(req, res) {
  res.send('Hallo!');
})

app.listen(config.app.PORT, _ => {
  console.log(`App listening on PORT ${config.app.PORT}`)
});
const config = require('./config/config.json')

//Dependencies
const express = require('express');

require('express-async-errors');    //Async error handling

//Dependencies

const app = express();

app.get('/', function(req, res) {
  res.render()
})

app.listen(config.app.PORT, _ => {
  console.log(`App listening on PORT ${config.app.PORT}`)
});
const exphbs = require('express-handlebars');
const exphbs_section = require('express-handlebars-sections');


//View engine setup
module.exports = function(app) {
  app.engine('hbs', exphbs({
    //Options
    defaultLayout: 'main.layout.hbs',
    extname: 'hbs',
    helpers: {
      section: exphbs_section(),
    },
  }));

  app.set('view engine', 'hbs');
}
const exphbs = require('express-handlebars');
const exphbs_section = require('express-handlebars-sections');
const numeral = require('numeral');

//View engine setup
module.exports = function(app) {
  app.engine('hbs', exphbs({
    //Options
    defaultLayout: 'main.layout.hbs',
    extname: 'hbs',
    helpers: {
      section: exphbs_section(),
      format(val) {
        return numeral(val).format('0,0');
      },
      priceFormat (val) {
        return val + ' đ'
      },
      minus(val1, val2) {
        return val1 - val2;
      },
      multiply(val1, val2) {
        return val1 * val2;
      },
      div(val1, val2) {
        return Math.floor(val1 / val2);
      },
      equals(val1, val2) {
        return val1 === val2;
      }
    },
  }));

  app.set('view engine', 'hbs');
}
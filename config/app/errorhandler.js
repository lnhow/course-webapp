const errors = {
  '404': {code: 404, status: 'Requested page not found'},
  '500': {code: 500, status: 'Internal Error'}
}

module.exports = function(app) {
  //User tried to enter non-exited pages
  //Root error handler: JUST BEFORE INTERNAL ERROR HANLDER
  app.use(function (req, res) {
    res.status(404).render('error', {
      layout: false,
      error: errors['404'],
    });
  });

  //Global default internal error handler: LAST
  app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).render('error', {
      layout: false,
      error: errors['500'],
    })
  });
}
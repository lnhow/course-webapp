const express = require('express');

module.exports = function(app) {
  app.get('/', function(req, res) {
    res.render('home.hbs');
  });

  app.use('/p', express.static('./public'));
  app.use('/courses', require('../../routes/courses.route'));
  app.use('/teacher', require('../../routes/teacher/teacher.route'))
  app.use('/admin', require('../../routes/admin/admin.route'));
}
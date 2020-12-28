const express = require('express');

module.exports = function(app) {
  app.get('/', function(req, res) {
    res.render('home.hbs');
  });

  app.use('/p', express.static('./public'));
  app.use('/teacher', require('../../routes/teacher/teacher.route'))
  app.use('/admin/categories', require('../../routes/admin/category.route'));
  app.use('/admin/courses', require('../../routes/admin/courses.route'));
}
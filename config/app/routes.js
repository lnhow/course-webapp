const express = require('express');
const courseModel = require('../../models/courses.model');

module.exports = function(app) {
  app.get('/', async function(req, res) {
    const limit = 10;
    //Highlight is the one with highest rating & highest rating count & view
    const highlights = await courseModel.get({
      ViewCount: -1,
      RatingCount: -1,
      RatingAverage: -1
    }, 3);
    const mostViewed = await courseModel.get({
      ViewCount: -1,
    }, limit);
    const newest = await courseModel.get({
      LastUpdate: -1,
    }, limit);
    // Most registered categories
    const highlightCats = await courseModel.registerCountByCat(5);
    console.log(highlightCats)

    res.render('home.hbs', {
      mostViewed,
      newest,
      highlights,
      highlightCats
    });
  });

  app.use('/p', express.static('./public'));
  app.use('/course', require('../../routes/course.route')); //Single course
  app.use('/courses', require('../../routes/courses.route'));
  app.use('/teacher', require('../../routes/teacher/teacher.route'))
  app.use('/admin', require('../../routes/admin/admin.route'));
}
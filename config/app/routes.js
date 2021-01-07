const express = require('express');
const courseModel = require('../../models/courses.model');

const authMdw = require('../../middlewares/auth.mdw');

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

    res.render('home.hbs', {
      mostViewed,
      newest,
      highlights,
      highlightCats
    });
  });

  //Block other static routes for security reason
  app.use('/p/imgs/courses', express.static('./public/imgs/courses'));
  app.use('/p/vids/courses', express.static('./public/vids/courses'));

  app.use('/search', require('../../routes/search.route'));
  app.use('/course', require('../../routes/course.route')); //Single course
  app.use('/courses', require('../../routes/courses.route'));

  //Account login, logout, verify
  app.use('/account', require('../../routes/account/account.route.js'));
  
  //Account student profile only
  app.use('/profile', authMdw.filterSpecialUser, require('../../routes/profile.route'));

  app.use('/teacher', authMdw.teacherAuth, require('../../routes/teacher/teacher.route'));
  app.use('/admin',authMdw.adminAuth, require('../../routes/admin/admin.route'));
}
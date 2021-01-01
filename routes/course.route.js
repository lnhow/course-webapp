const router = require('express').Router();
const coursesModel = require('../models/courses.model');

router.get('/', function (req, res) {
  res.redirect('/');
});

router.get('/:id', async function (req, res) {
  const id = req.params.id;
  const result = await coursesModel.singleByID(id);

  if (result === null) {
    res.status(404).render('error', {
      layout: false,
      error: {
        code: 404,
        status: 'Course requested not found'
      },
    })
  }
  else {
    res.render('vwCourses/teacher_courses_detail', {
      
    });
  }
});

module.exports = router;
const router = require('express').Router();
const chaptersModel = require('../models/chapters.model');
const coursesModel = require('../models/courses.model');

router.get('/', function (req, res) {
  res.redirect('/');
});

router.get('/:id', async function (req, res) {
  const id = req.params.id;
  const resultCourse = await coursesModel.singleByID(id);
  const resultChapter = await chaptersModel.allInCourse(id);

  if (resultCourse === null) {
    res.status(404).render('error', {
      layout: false,
      error: {
        code: 404,
        status: 'Course requested not found'
      },
    })
  }
  else {
    //Update view counter
    await coursesModel.incViewCount(resultCourse._id)
    //Get 5 more in the same category
    const resultSameCoursesInCat = await coursesModel.byCatMinus(
        resultCourse.Category._id,
        resultCourse._id, 
        5
      );
    res.render('vwCourses/course_details', {
      course: resultCourse,
      chapters: resultChapter,
      mores: resultSameCoursesInCat
    });
  }
});

module.exports = router;
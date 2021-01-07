const router = require('express').Router();
const courseModel = require('../../models/courses.model');

router.get('/', async function(req, res) {
  const result = await courseModel.allByTeacher(req.session.authUser._id);

  res.render('vwTeacher/index', {
    layout: 'special_user.layout.hbs',
    courses: result
  });
})

router.use('/course', require('./course.route'));

module.exports = router;
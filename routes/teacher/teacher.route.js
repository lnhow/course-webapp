const router = require('express').Router();
const userModel = require('../../models/users.model');
const courseModel = require('../../models/courses.model');

router.get('/', async function(req, res) {
  const result = await courseModel.allByTeacher(req.session.authUser._id);

  res.render('vwTeacher/index', {
    layout: 'special_user.layout.hbs',
    courses: result
  });
});

router.use('/course', require('./course.route'));

router.get('/about-me', async function(req, res) {
  const result = await userModel.singleById(req.session.authUser._id);

  //console.log(result);

  res.render('vwTeacher/about', {
    account: result,
    layout: 'special_user.layout.hbs'
  })
});

router.post('/about-me', async function(req, res) {

  //console.log(req.body);
  const ret = await userModel.patchAboutInfo(req.body);

  res.redirect('/teacher/about-me');
});

module.exports = router;
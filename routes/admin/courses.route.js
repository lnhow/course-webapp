const router = require('express').Router();
const courseModel = require('../../models/courses.model');

router.get('/', async function(req, res) {
  const ret = await courseModel.all();
  console.log(ret);
  
  res.render('vwCourses/admin_courses', {
    layout: 'special_user.layout.hbs',
    courses: ret,
  });
});

router.post('/del', async function (req, res) {
  const ret = await categoryModel.del(req.body);
  res.redirect('/admin/categories');
})

module.exports = router;
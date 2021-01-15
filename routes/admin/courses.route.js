const router = require('express').Router();
const courseModel = require('../../models/courses.model');
const fileUtils = require('../../utils/file')

router.get('/', async function(req, res) {
  const ret = await courseModel.all();
  //console.log(ret);
  
  res.render('vwCourses/admin_courses', {
    layout: 'admin.layout.hbs',
    courses: ret,
  });
});

router.post('/delete', async function (req, res) {
  const id = req.body._id;
  const result = await courseModel.toggleDisable(id);
  
  // Remove all course uploaded resourses (ID DELETE COURSE)
  // if (result.ok === 1) {
  //   //Remove image
  //   fileUtils.remove(`${fileUtils.coursesImgPath}${id}/`);
  //   fileUtils.remove(`${fileUtils.coursesVidPath}${id}/`);
  // }
  
  res.redirect(req.headers.referer);
})

module.exports = router;
const router = require('express').Router();
const courseModel = require('../../models/courses.model');
const categoryModel = require('../../models/categories.model');
const fileUtils = require('../../utils/file')

router.get('/', async function(req, res) {
  let catId = (req.query.cat)? req.query.cat: 0;

  if (catId === "0") {
    catId = 0;
  }

  const resultCourse = await courseModel.all(catId);
  const resultCategory = await categoryModel.all();
  //console.log(ret);
  resultCategory.map((cat) => {//Select default filter cat
    cat.SubCats.map((subcat) => {
      if (String(subcat.CatID) == catId) {
        subcat.selected = true;
      }
      return subcat;
    })
    return cat;
  })
  
  res.render('vwCourses/admin_courses', {
    layout: 'admin.layout.hbs',
    courses: resultCourse,
    categories: resultCategory,
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
const router = require('express').Router();
const config = require('../config/config.json');

const categoryModel = require('../models/categories.model');
const courseModel = require('../models/courses.model');

router.get('/:catID', async function(req, res) {
  const CatID = req.params.catID;
  const page = (+req.query.page) || 1;

  const skip = config.app.pagination.limit * (page - 1);
  const result = await courseModel.byCat(CatID, skip);
  const totalResult = await courseModel.countByCat(CatID);

  const numPages = Math.ceil(totalResult / config.app.pagination.limit);   //Number type is not int
  const pageItems = [];
  for(let i = 1;i <= numPages; i++) {
    pageItems.push({
        value: i,
        isActive: i === page
    });
  }

  res.render('vwCourses/courses_byCat',{
    courses: result,
    pageItems,
    canGoPrev: page > 1,
    canGoNext: page < numPages,
    prevPage: page - 1,
    nextPage: page + 1,
  });
});

module.exports = router;
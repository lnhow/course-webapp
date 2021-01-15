const router = require('express').Router();
const courseModel = require('../models/courses.model');

const config = require('../config/config.json')

router.get('/', async function(req, res) {
  const keyword = req.query.keyword? req.query.keyword : "";
  const sort = req.query.sort? req.query.sort : 'default';
  const page = (+req.query.page) || 1;

  const skip = (page - 1) * config.app.pagination.limit;

  //console.log(keyword);
  const result = await courseModel.search(keyword, sort, skip);
  //console.log(result);

  //For pagination links
  //Replace all ' ' in keyword
  const currentQuery = 'keyword=' + keyword.replace(/ /g, '+') + '&sort=' + sort;
  const numPages = Math.ceil(result.count / config.app.pagination.limit);   //Number type is not int
  const pageItems = [];
  for(let i = 1; i <= numPages; i++) {
    pageItems.push({
        value: i,
        isActive: i === page
    });
  }

  res.render('search', {
    keyword,
    result,
    currentQuery,
    pageItems,
    canGoPrev: page > 1,
    canGoNext: page < numPages,
    prevPage: page - 1,
    nextPage: page + 1,
  });
});

module.exports = router;
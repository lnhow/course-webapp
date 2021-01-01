const router = require('express').Router();

router.get('/', function(req, res) {
  res.render('vwTeacher/index', {
    layout: 'special_user.layout.hbs'
  });
})

router.use('/course', require('./course.route'));

module.exports = router;
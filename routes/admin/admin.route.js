const router = require('express').Router();

router.get('/', function (req, res) {
  res.render('vwAdmin/index', {
    layout: 'admin.layout.hbs'
  })
});

router.use('/categories', require('./category.route'));
router.use('/courses', require('./courses.route'));
router.use('/accounts', require('./accounts.route'));

module.exports = router;
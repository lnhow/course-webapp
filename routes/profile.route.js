const router = require('express').Router();
const authMdws = require('../middlewares/auth.mdw');

//Only students can access this
router.get('/', async function(req, res){
  res.render('vwProfile/index.hbs')
});

module.exports = router;
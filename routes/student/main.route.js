const router = require('express').Router();

module.exports = router;

router.get('/', async function (req, res){
    res.render('vwStudent/index');
})
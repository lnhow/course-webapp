const router = require('express').Router();

module.exports = router;

router.get('/register', async function (req, res){
    res.render('vwAccount/register');
})

module.exports = router;
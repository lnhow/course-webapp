const express = require('express');
const bcrypt = require('bcryptjs');
const monent =  require('moment');

const userModel = require('../../models/user.model')
const router = express.Router();

module.exports = router;

router.get('/login', async function (req, res){
    res.render('vwAccount/login');
})

router.post('/login', async function (req, res){

})

router.get('/register', async function (req, res){
    res.render('vwAccount/register');
})

router.post('/register', async function (req, res){
    const hash = bcrypt.hashSync(req.body.password, 10);
    const dob = moment(req.body.dob, 'DD/MM/YYYY').format('YYYY-MM-DD');
    const user = {
        username: res.body.username,
        password: hash,
        dob: dob,
        name: req.body.name,
        email: req.body.email
    }

    await userModel.add(user);
    res.render('vwAccount/register');
})
module.exports = router;
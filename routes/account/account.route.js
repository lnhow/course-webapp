const express = require('express');
const bcrypt = require('bcryptjs');
const monent =  require('moment');

const userModel = require('../../models/users.model')
const router = express.Router();

module.exports = router;

router.get('/login', async function (req, res){
    res.render('vwAccount/login');
})

router.post('/login', async function (req, res){
    const email = await userModel.singByEmail(req.body.email);
    if(email === null)
    {
        return res.render('vwAccount/login', {
            err_message: 'Invalid email or password!'
        });
    }

    const ret = bcrypt.compareSync(req.body.password, user.password);
    if(ret === false)
    {
        return res.render('vwAccount/login', {
            err_message: 'Invalid email or password!'
        });
    }

    let url='/';
    res.redirect(url);
})

router.get('/register', async function (req, res){
    res.render('vwAccount/register');
})

router.post('/register', async function (req, res){
    const hash = bcrypt.hashSync(req.body.Password, 10);
    const user = {
        Email: req.body.Email,
        Password: hash,
        Username: req.body.Username,
        Permission: 2,
    }

    await userModel.add(user);
    res.render('vwAccount/register');
})

router.get('/is-available', async function(req, res){
    const username = req.query.Username;
    const user = await userModel.singleByUsername(username);
    if(user == null){
        return res.json(true);
    }
    res.json(false);
})
module.exports = router;
const express = require('express');
const bcrypt = require('bcryptjs');
const monent =  require('moment');

const userModel = require('../../models/users.model')
const router = express.Router();

module.exports = router;

router.get('/login', async function (req, res){
    res.render('vwAccount/login');
});

router.get('/logout', function (req, res) {
    req.session.isAuth = false;
    req.session.authUser = null;
    req.session.cart = [];
    res.redirect('/');
})

router.post('/login', async function (req, res){
    const email = req.body.Email;
    
    const user = await userModel.singleByEmail(email);
    if(user === null)
    {
        return res.render('vwAccount/login', {
            err_message: 'Invalid Email or password!'
        });
    }
    console.log(user);
    console.log(req.body.Password)
    console.log(user.password)
    const ret = bcrypt.compareSync(req.body.Password, user.Password);
    if(ret === false)
    {
        return res.render('vwAccount/login', {
            err_message: 'Invalid Email or password!'
        });
    }

    req.session.isAuth = true;
    req.session.authUser = user;

    let url = req.session.retUrl || '/';
    res.redirect(url);
})

router.get('/register', async function (req, res){
    res.render('vwAccount/register');
})

router.post('/register', async function (req, res){
    const hash = bcrypt.hashSync(req.body.Password,10, null);
    const user = {
        Email: req.body.Email,
        Password: hash,
        Permission: 2,
        Name: req.body.Name,
    }

    await userModel.add(user);
    res.render('vwAccount/register');
})

router.get('/is-available', async function(req, res){
    const email = req.query.Email;
    const user = await userModel.singleByEmail(email);
    if(user === null){
        return res.json(true);
    }
    console.log(user);
    res.json(false);
})
module.exports = router;
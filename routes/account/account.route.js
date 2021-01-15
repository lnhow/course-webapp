const express = require('express');
const bcrypt = require('bcryptjs');

const authMdws = require('../../middlewares/auth.mdw');
const userModel = require('../../models/users.model');
const otpmailer = require('../../utils/otpmailer');
const router = express.Router();

module.exports = router;

router.get('/login', authMdws.filterAuthed, async function (req, res){
    res.render('vwAccount/login');
});

router.get('/logout', function (req, res) {
    req.session.isAuth = false;
    req.session.authUser = null;
    req.session.cart = [];
    res.redirect('/');
})

router.post('/login', authMdws.filterAuthed, async function (req, res){
    const email = req.body.Email;

    const user = await userModel.singleByEmail(email);
    if(user === null)
    {
        res.render('vwAccount/login', {
            err_message: 'Invalid Email'
        });
        return;
    }
    if(user.IsDisabled)
    {
        res.render('vwAccount/login', {
            err_message: 'This account is currently disabled'
        });
        return;
    }
    //console.log(user);
    //console.log(user.Password);
    const ret = bcrypt.compareSync(req.body.Password, user.Password);
    if(ret === false)
    {
        res.render('vwAccount/login', {
            err_message: 'Invalid Email or password!'
        });
        return;
    }

    delete user.Password;
    req.session.isAuth = true;
    req.session.authUser = user;

    //console.log(user);

    let url = req.session.retUrl || '/';

    if (!user.Verified) {
        res.redirect('/account/verify');
    }
    else {
        res.redirect(url);
    }
})

router.get('/register', authMdws.filterAuthed, async function (req, res){
    const err = req.query.existed === "true"? true : false;

    res.render('vwAccount/register', {
        message: err? 'There is already an account using this email' : null,
    });
})

router.post('/register', authMdws.filterAuthed, async function (req, res){
    const user = await userModel.singleByEmail(req.body.Email);

    if (user !== null) {
        res.redirect('/account/register?existed=true');
        return;
    }

    const hash = bcrypt.hashSync(req.body.Password,10, null);
    const temp = otpmailer.sendOTPMail(req.body.Email);   //Promise pending
    //console.log(temp);
    const otp = temp.then(async (value)=>{
        //console.log(value);
        const user = {
            Email: req.body.Email,
            Password: hash,
            Permission: 2,
            Name: req.body.Name,
            SecretOTP: value,
        }
    
        const result = await userModel.add(user);

        if (result) {
            result.Verified = false;
            delete result.SecretOTP;
            delete result.Password;
            
            req.session.isAuth = true;
            req.session.authUser = result;
        }

        //console.log(result);
        
        res.redirect('/account/verify');
    })
    // console.log(otp);
    // const user = {
    //     Email: req.body.Email,
    //     Password: hash,
    //     Permission: 2,
    //     Name: req.body.Name,
    //     SecretOTP: otp,
    // }

    // await userModel.add(user);  
    // res.render('vwAccount/verify');
})

router.get('/is-available', async function(req, res){
    const email = req.query.Email;
    const user = await userModel.singleByEmail(email);
    if(user === null){
        return res.json(true);
    }
    //console.log(user);
    res.json(false);
})

router.get('/verify', authMdws.auth, async function (req, res){
    const account = await userModel.singleById(req.session.authUser._id);
    //console.log(account)

    //Block verified users
    if (!account.SecretOTP) {
        res.redirect('/');
        return;
    }
    res.render('vwAccount/verify');
});

router.post('/verify', authMdws.auth, async function (req, res){

    const secretToken = +req.body.inputOTP; //Cast to Number

    const account = await userModel.singleById(req.session.authUser._id);
    if(secretToken !== account.SecretOTP) {
        //console.log('false');
        res.render('vwAccount/verify', {
            message: 'Incorrect code',
        });
        return;
    }

    //console.log('true');
    await userModel.patchOTP(account._id, null);
    //Re-update session user
    const update = await userModel.singleById(account._id);
    update.Verified = (update.SecretOTP === null) ? true: false;
    delete update.SecretOTP;
    req.session.authUser = update;
    //console.log(req.session.authUser);

    res.redirect(req.session.retUrl || '/');
})

router.get('/edit', authMdws.auth, async function (req, res){
    const account = await userModel.singleById(req.session.authUser._id);

    let message = null
    if (req.query.success !== undefined) {
        message = req.query.success === "true"?"Success":"Failed";
    }

    let backRoute = null; //path for the back button
    if (account.Permission == 0) {
        backRoute = '/admin';
    }
    else if (account.Permission == 1) {
        backRoute = '/teacher';
    }
    else {
        backRoute = '/'
    }

    res.render('vwAccount/edit', {
        account,
        message,
        backRoute
    });
});


router.post('/edit', async function (req, res){

    const result = await userModel.patchAccountInfo(req.body);

    if (result) {
        //Update Success, reUpdate localuser to display
        const update = await userModel.singleById(req.body._id);
        update.Verified = (update.SecretOTP) ? false:true;
        delete update.SecretOTP;

        req.session.authUser = update;
    }

    res.redirect('/account/edit');
});

router.post('/reset', async function (req, res){
    const account = req.body;
    const user = await userModel.singleById(account._id);
    //console.log(account);
    //console.log(user);
    const ret = bcrypt.compareSync(account.currentPassword, user.Password);
    
    if (!ret) {
        res.redirect('/account/edit?success=false');
        return;
    }

    const hash = bcrypt.hashSync(account.Password,10, null);
    const isPatched = await userModel.patchPassword({
        _id: account._id,
        Password: hash
    });

    if (isPatched) {
        res.redirect('/account/edit?success=true');
        return;
    }

    res.redirect('/account/edit?success=true');
});
module.exports = router;
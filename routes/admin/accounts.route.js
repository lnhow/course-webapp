const router = require('express').Router();
const bcrypt = require('bcryptjs');
const userModel = require('../../models/users.model');

router.get('/', async function(req, res) {
  const result = await userModel.allNonAdmin();

  res.render('vwAdmin/vwAccount/admin_accounts', {
    layout: 'admin.layout.hbs',
    accounts: result
  });
});

router.get('/add', async function(req, res) {
  res.render('vwAdmin/vwAccount/add', {
    layout: 'admin.layout.hbs',
  });
});

router.post('/add', async function(req, res) {
  const hash = bcrypt.hashSync(req.body.Password, 10, null);

  const user = {
    Email: req.body.Email,
    Name: req.body.Name,
    SecretOTP: null,
    Password: hash,
    Permission: req.body.Permission,
  }

  await userModel.add(user);

  res.redirect('/admin/accounts');
});

router.get('/:id', async function(req, res) {
  const id = req.params.id;

  const result = await userModel.singleById(id);

  if (result === null) {
    res.redirect('admin/accounts');
  }
  else {
    let message = null;

    if (req.query.success !== undefined) {
      message = req.query.success === "true"?"Success":"Failed";
    }

    res.render('vwAdmin/vwAccount/edit', {
      layout: 'admin.layout.hbs',
      account: result,
      message: message,
    });
  }
});

router.post('/patch', async function(req, res) {
  console.log(req.body);

  const user = {
    _id: req.body._id,
    Email: req.body.Email,
    Name: req.body.Name,
    About: req.body.About,
    Permission: req.body.Permission,
  }

  await userModel.patchInfo(user);

  res.redirect(`/admin/accounts/${user._id}`);
});

router.post('/reset', async function(req, res) {
  const hash = bcrypt.hashSync(req.body.Password, 10, null);

  const user = {
    _id: req.body._id,
    Password: hash,
  }

  const result = await userModel.patchPassword(user);

  if (result) {
    res.redirect(`/admin/accounts/${user._id}?success=true`);
  }
  else {
    res.redirect(`/admin/accounts/${user._id}?success=false`);
  }
});

router.post('/delete', async function(req, res) {
  const id = req.body._id;

  const result = await userModel.toggleDisable(id);

  res.redirect(req.headers.referer);
});

module.exports = router;
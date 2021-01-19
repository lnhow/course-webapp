const router = require('express').Router();
const categoriesModel = require('../../models/categories.model');

router.get('/', async function(req, res) {
  const result = await categoriesModel.all();

  res.render('vwAdmin/admin_category', {
    layout: 'admin.layout.hbs',
    categories: result,
  });
});

router.post('/add', async function(req, res) {
  const entity = req.body;

  await categoriesModel.add({
    CatParent: (typeof entity.CatParent === 'undefined') ? null:entity.CatParent,
    CatName: entity.CatName
  });

  res.redirect(req.headers.referer);
});

router.post('/patch', async function(req, res) {
  const entity = req.body;
  await categoriesModel.patch(entity);

  res.redirect(req.headers.referer);
});

router.post('/del', async function(req, res) {
  const entity = req.body;
  const result = await categoriesModel.del(entity);

  if (result === false) {
    res.redirect(req.headers.referer);
  }
  else {
    res.redirect('/admin/categories');
  }
});

//LAST
router.get('/:catid', async function(req, res) {
  const result = await categoriesModel.singleMainCategory(req.params.catid);

  res.render('vwAdmin/admin_edit_category', {
    layout: 'admin.layout.hbs',
    category: result[0]
  });
});

module.exports = router;
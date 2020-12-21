const router = require('express').Router();
const categoriesModel = require('../../models/categories.model');

router.get('/', async function(req, res) {
  const result = await categoriesModel.all();

  console.log('GET')
  console.log(result);
  console.log(result[0].SubCats);

  res.render('admin_category', {
    layout: 'special_user.layout.hbs',
    categories: result,
  });
});

router.post('/add', async function(req, res) {
  const ret = req.body;
  console.log('ADD');
  console.log(ret);
  console.log({
    CatParent: (typeof ret.CatParent === 'undefined') ? null:ret.CatParent,
    CatName: ret.CatName
  });

  await categoriesModel.add({
    CatParent: (typeof ret.CatParent === 'undefined') ? null:ret.CatParent,
    CatName: ret.CatName
  });

  res.redirect('/admin/categories');
});

module.exports = router;
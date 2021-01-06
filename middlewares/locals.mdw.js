const categoryModel = require('../models/categories.model');

module.exports = function (app) {
  app.use(async function (req, res, next) {
    if (typeof (req.session.isAuth) === 'undefined') {
      req.session.isAuth = false;
    }

    res.locals.isAuth = req.session.isAuth;
    res.locals.authUser = req.session.authUser;
    next();
  })

  app.use(async function (req, res, next) {
    const rows = await categoryModel.all();
    res.locals.lcCategories = rows;
    next();
  })
}
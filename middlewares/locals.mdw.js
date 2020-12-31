const categoryModel = require('../models/categories.model');

module.exports = function (app) {
  // app.use(async function (req, res, next) {
  //   if (typeof (req.session.isAuth) === 'undefined') {
  //     req.session.isAuth = false;
  //     req.session.cart = [];
  //   }

  //   res.locals.isAuth = req.session.isAuth;
  //   res.locals.authUser = req.session.authUser;
  //   res.locals.cartSummary = cartModel.getNumberOfItems(req.session.cart)
  //   next();
  // })

  app.use(async function (req, res, next) {
    const rows = await categoryModel.all();
    res.locals.lcCategories = rows;
    next();
  })
}
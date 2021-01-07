const router = require('express').Router();
const authMdws = require('../middlewares/auth.mdw');
const userCourseModel = require('../models/users_course.model')

//Only students can access this
router.get('/', authMdws.filterSpecialUser, async function(req, res){
  const favorites = await userCourseModel.allFavoriteWithUserID(req.session.authUser._id);
  const others = await userCourseModel.allNonFavoriteWithUserID(req.session.authUser._id);

  res.render('vwProfile/index.hbs', {
    favorites,
    others
  })
});

//Toggle course favorite
router.post('/', authMdws.filterSpecialUser, async function(req, res){
  const userID = req.session.authUser._id;
  const courseID = req.body._id;
  const ret = await userCourseModel.toggleFavorite(userID, courseID);
  res.redirect(req.headers.referer);  //Can be reference else where
});

module.exports = router;
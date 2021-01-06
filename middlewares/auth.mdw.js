const Permission = {
  'Admin': 0,
  'Teacher': 1,
  'Student': 2,
};
//Admin can only be in /admin, teacher can only be in /teacher
const userRoute = {
  'Admin': '/admin',
  'Teacher': '/teacher',
  'Else': '/',
};

module.exports = {
  adminAuth: function(req, res, next) {
    
    if (req.session.isAuth === false) {
      req.session.retUrl = req.originalUrl;
      return res.redirect('/account/login');
    }
    else if (
      typeof(req.session.authUser) === 'undefined' 
      || req.session.authUser.Permission !== Permission['Admin']
      ) {
      if (req.session.authUser.Permission === Permission['Teacher']) {
        return res.redirect(userRoute['Teacher']);
      }
      else {
        return req.redirect(userRoute['Else']);
      }
    }
  
    next();
  }
}
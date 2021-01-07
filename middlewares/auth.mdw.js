const { use } = require("../routes/teacher/course.route");

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
  //Authentication for admin routes
  adminAuth: function(req, res, next) {
    
    if (req.session.isAuth === false) {
      req.session.retUrl = req.originalUrl;
      return res.redirect('/account/login');
    }
    else if (
      //Not auth or not having correct permission
      typeof(req.session.authUser) === 'undefined' 
      || req.session.authUser.Permission !== Permission['Admin']
      ) {
      if (req.session.authUser.Permission === Permission['Teacher']) {
        return res.redirect(userRoute['Teacher']);
      }
      else {
        return res.redirect(userRoute['Else']);
      }
    }
  
    next();
  },
  //Authentication for teacher route
  teacherAuth: function(req, res, next) {
    
    if (req.session.isAuth === false) {
      req.session.retUrl = req.originalUrl;
      return res.redirect('/account/login');
    }
    else if (
      //Not auth or not having correct permission
      typeof(req.session.authUser) === 'undefined' 
      || req.session.authUser.Permission !== Permission['Teacher']
      ) {
      if (req.session.authUser.Permission === Permission['Admin']) {
        return res.redirect(userRoute['Admin']);
      }
      else {
        return res.redirect(userRoute['Else']);
      }
    }
  
    next();
  },

  //Normal auth for anything that need it (profile)
  auth: function(req, res, next) {
    if (req.session.isAuth === false) {
      req.session.retUrl = req.originalUrl;
      return res.redirect('/account/login');
    }

    next();
  },

  //Block already logged in user from accessing next()
  filterAuthed: function(req, res, next) {
    if (req.session.isAuth === true) {
      //Block logged in user
      if (req.session.authUser.Permission === Permission['Admin']) {
        res.redirect(userRoute['Admin']);
      }
      else if (req.session.authUser.Permission === Permission['Teacher']) {
        res.redirect(userRoute['Teacher']);
      }
      else {
        console.log('else');
        res.redirect(userRoute['Else'])
      }
      
      return;
    }

    next();
  }

}
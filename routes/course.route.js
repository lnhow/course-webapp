const router = require('express').Router();
const chaptersModel = require('../models/chapters.model');
const coursesModel = require('../models/courses.model');
const authMdws = require('../middlewares/auth.mdw');
const users_courseModel = require('../models/users_course.model');
const { updateLastChapter } = require('../models/users_course.model');

router.get('/', function (req, res) {
  res.redirect('/');
});

router.get('/:id', async function (req, res) {
  const courseId = req.params.id;
  const resultCourse = await coursesModel.singleByID(courseId);
  const resultChapter = await chaptersModel.allInCourse(courseId);
  const resultFeedbacks = await users_courseModel.listFeedback(courseId);
  let resultUserCourse = null;

  if (req.session.isAuth) {
    const userID = req.session.authUser._id;
    //Get User-course
    resultUserCourse = await users_courseModel.singleUserCourse(userID, courseId);
    //console.log(resultUserCourse);

    if (resultUserCourse !== null) {
      //User has registed to this course
      //Mark completed & current chapters in progress
      let i = 0;
      for (; i < resultChapter.length && i < resultUserCourse.chapter; i++) {
        resultChapter[i].completed = true;
      }
    }

    for (let i = 0; i < resultChapter.length; i++) {
      resultChapter[i].order = i + 1;   //Number ordering for each chapter
    }
  }

  if (resultCourse === null) {
    res.status(404).render('error', {
      layout: false,
      error: { code: 404, status: 'Course requested not found' },
    });
    return;
  } //Else
  
  //Update view counter
  await coursesModel.incViewCount(resultCourse._id)
  //Get 5 more in the same category
  const resultSameCoursesInCat = await coursesModel.byCatMinus(
    resultCourse.Category._id,
    resultCourse._id, 
    5
  );
  res.render('vwCourses/course_details', {
    course: resultCourse,         //Info on this course
    chapters: resultChapter,      //Info about chapters in this course
    feedbacks: resultFeedbacks,
    user_course: resultUserCourse,//Info whether user has register this course or not

    mores: resultSameCoursesInCat
  });
  
});

//get chapter in pos chapterOrder
router.get('/:id/:chapterOrder', authMdws.auth, async function (req, res) {
  const courseID = req.params.id;
  const order = +req.params.chapterOrder; //cast to int

  const userCourse = await users_courseModel.singleUserCourse(req.session.authUser._id, courseID);
  
  const resultChapter = await chaptersModel.singleInCourse(courseID, order);
  
  // User hasn't register course yet or chapter not exist
  if (userCourse === null || resultChapter === null) {
    res.redirect(`/course/${courseID}`);
    return;
  } //else

  //User try to access chapter ahead of next chapter
  if (order > userCourse.chapter + 1) {
    res.redirect(`/course/${courseID}/${userCourse.chapter}`);
    return;
  } //else

  if (userCourse.chapter >= order) { //User already completed this chapter
    resultChapter.Chapter.completed = true;
  }

  res.render('vwCourses/vwChapter/singleChapter', {
    Chapter: resultChapter.Chapter,
    Prev: order - 1,
    Next: order + 1,
    CanGoPrev: (order - 1) > 0,
    CanGoNext: (order + 1) < resultChapter.count,
  });
});

router.post('/:id/register', authMdws.auth, async function(req, res){
  const userID = req.session.authUser._id;
  const courseID = req.params.id; 
  const ret = await users_courseModel.register(userID, courseID);
  res.redirect(`/course/${courseID}`);
});

router.post('/:id/feedback', authMdws.auth, async function(req, res){
  const userID = req.session.authUser._id;
  const courseID = req.params.id;
  const form = req.body;
  //console.log(form);
  const ret = await users_courseModel.feedback(userID, courseID, {
    score: parseFloat(form.score),
    feedback: form.feedback
  });
  res.redirect(`/course/${courseID}`);
});

router.post('/:id/favorite', authMdws.auth, async function(req, res){
  const userID = req.session.authUser._id;
  const courseID = req.params.id; 
  const ret = await users_courseModel.toggleFavorite(userID, courseID);
  res.redirect(req.headers.referer);  //Can be reference else where
});

//user completed this chapter
router.post('/:id/:chapterOrder', authMdws.auth, async function (req, res) {
  const courseID = req.params.id;
  const order = +req.params.chapterOrder; //cast to int

  const userCourse = await users_courseModel.singleUserCourse(req.session.authUser._id, courseID);
  const resultChapter = await chaptersModel.singleInCourse(courseID, order);
  
  // User hasn't register course yet or chapter not exist
  if (userCourse === null || resultChapter === null) {
    res.redirect(`/course/${courseID}`);
    return;
  } //else

  if (userCourse.chapter > order) { //User already completed this chapter
    res.redirect(`/course/${courseID}`);
    return;
  }

  const result = await updateLastChapter(req.session.authUser._id, courseID);

  res.redirect(`/course/${courseID}/${order}`);
});

module.exports = router;
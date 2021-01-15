const router = require('express').Router();
const multer = require('multer');

const path = require('path');
const url = require('url');
const fileUtils = require('../../utils/file');

const categoryModel = require('../../models/categories.model');
const courseModel = require('../../models/courses.model');
const chapterModel = require('../../models/chapters.model');


router.get('/add', async function(req, res) {
  const result = await categoryModel.all();

  res.render('vwCourses/add', {
    layout: 'special_user.layout.hbs',
    categories: result
  });
});


//Route for upload course title image
router.post('/img', async function(req, res) {
  let filename = null;

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, fileUtils.tmpImgPath)
    },
    filename: function (req, file, cb) {
      filename = file.originalname;
      cb(null, file.originalname)
    }
  });

  const upload = multer({
    storage,
    fileFilter: function(req, file, cb) {
      const ext = path.extname(file.originalname);
      if(ext === '.jpg') {//Only accept .jpg
        return cb(null, true);
      }
      cb(new Error(`File type blocked ${ext}`), false);
    },
    limits: {
      fileSize: 512 * 1024, //Max image size: 512 KB (in bytes)
    }
  });
  upload.single('imgTitle')(req, res, async function(err) {
    const id = req.body._id;

    //TODO: Check valid

    if (err) {
      console.log('img upload failed')
      console.log(err);
      res.redirect(url.format({
        pathname: `/teacher/course/${id}`,
        query: {
           'err_upload': true,
         }
      }));
    }
    else {
      const ret = await courseModel.singleByID(id); //Check ID
      if (ret !== null) {
        const oldPath = `${fileUtils.tmpImgPath}${filename}`;
        const newPath = `${fileUtils.coursesImgPath}${ret._id}/`;
        fileUtils.newdir(newPath);
        fileUtils.move(
          oldPath,
          path.join(newPath, `thumbnail${path.extname(filename)}`)
        );
        res.redirect(url.format({
          pathname: `/teacher/course/${id}`,
          query: {
            'upload_success': true,
          }
        }));
      }
      else {
        //Id not exists
        res.redirect(url.format({
          pathname: `/teacher/course/${id}`,
          query: {
             'err_upload': true,
           }
        }));
      }
    }
  });
});
router.post('/add', async function(req, res) {
  //console.log(req.body);
  const course = req.body;
  if (!req.session.authUser || req.session.authUser.Permission !== 1) {
    res.redirect('/');    //Don't have permission to post this
    return;
  }

  course.Teacher = req.session.authUser._id;

  const ret = await courseModel.add(course);
  //Create a new directory for imgs
  const imgPath = `${fileUtils.coursesImgPath}${ret._id}`;

  fileUtils.newdir(imgPath);
  fileUtils.copy('./public/imgs/tmp_thumbnail.jpg',imgPath+'/thumbnail.jpg');//Placeholder until update course img

  //console.log(ret);
  res.redirect(url.format({
    pathname: `/teacher/course/${ret.id}`,
    query: {
      'chapter': false
    }
  }));
});
router.post('/patch', async function(req, res) {
  const ret = await courseModel.patch(req.body);
  res.redirect(req.headers.referer);
});

router.use('/chapter', require('./chapter.route'));


//IMPORTANT: Last of /*
router.get('/:id', async function (req, res) {
  const id = req.params.id;
  const err_upload = req.query.err_upload;
  const upload_success = req.query.upload_success;
  const show_chapter = req.query.chapter;
  let err_message = null;
  let upload_message = null;

  if (err_upload) {
    err_message = "Upload file error";
  }
  if (upload_success) {
    upload_message = "Upload file success";
  }

  const result = await courseModel.singleByID(id);
  const resultCategory = await categoryModel.all();
  const resultChapter = await chapterModel.allInCourse(id);

  //console.log(resultChapter);

  if (result === null || resultCategory === null) {
    res.status(404).render('error', {
      layout: false,
      error: {
        code: 404,
        status: 'Course requested not found'
      },
    })
  }
  else {
    //Block teachers who are not the author of this course from accessing
    if (result.Teacher._id.toString() !== req.session.authUser._id) {
      res.redirect('/teacher');
      return;
    }

    //Set the current category to default in page
    resultCategory.forEach(mainCat => {
      mainCat.SubCats.forEach(subcat => {
        subcat.selected = subcat.CatID.toString() === result.Category._id.toString();
      });
    });

    res.render('vwCourses/teacher_courses_detail', {
      layout: 'special_user.layout.hbs',
      course: result,
      categories: resultCategory,
      chapters: resultChapter,
      err_message: err_message,
      message: upload_message,
      show_chapter: show_chapter
    });
  }
});


router.post('/:id/add', async function(req, res) {
  const courseId = req.params.id;

  const result = await chapterModel.add(req.body);
  res.redirect(url.format({
    pathname: `/teacher/course/${courseId}`,
    query: {
      'chapter': true
    }
  }));
})

//IMPORTANT: Last of /:id/*
router.get('/:id/:chapterId', async function (req, res) {
  const courseId = req.params.id;
  const chapterId = req.params.chapterId;

  const resultCourse = await courseModel.singleByID(courseId);
  const resultChapter = await chapterModel.singleByID(chapterId);

  if (resultCourse === null || resultChapter === null) {
    res.status(404).render('error', {
      layout: false,
      error: {
        code: 404,
        status: 'Chapter requested not found'
      },
    })
  }
  else {
    console.log(resultCourse.Teacher);
    //Block teachers who are not the author of this course from accessing
    if (resultCourse.Teacher._id.toString() !== req.session.authUser._id) {
      res.redirect('/teacher');
      return;
    }

    res.render('vwCourses/vwChapter/editSingleChapter', {
      layout: 'special_user.layout.hbs',
      course: resultCourse,
      chapter: resultChapter
    });
  }
});


module.exports = router;
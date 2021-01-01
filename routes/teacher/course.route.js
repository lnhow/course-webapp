const router = require('express').Router();
const multer = require('multer');

const path = require('path');
const fileUtils = require('../../utils/file');

const categoryModel = require('../../models/categories.model');
const courseModel = require('../../models/courses.model');
const file = require('../../utils/file');


router.get('/add', async function(req, res) {
  const result = await categoryModel.all();

  res.render('vwCourses/add', {
    layout: 'special_user.layout.hbs',
    categories: result
  });
});

router.post('/img', async function(req, res) {
  let filename = null;

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, fileUtils.tmpImgPath);
    },
    filename: function (req, file, cb) {
      filename = file.originalname;
      cb(null, file.originalname);
    }
  });

  const upload = multer({storage});
  upload.single('imgTitle')(req, res, async function(err) {
    //console.log(req.body);
    if (err) {
      console.log('img upload failed')
      console.log(err);
    }
    else {
      console.log('img upload success');
      const ret = await courseModel.add(req.body);
      if (ret) {
        const oldPath = `${fileUtils.tmpImgPath}${filename}`;
        const newPath = `${fileUtils.coursesImgPath}${ret._id}/`;
        fileUtils.newdir(newPath);
        fileUtils.move(
          oldPath,
          path.join(newPath, `thumbnail${path.extname(filename)}`)
        );
      }
    }
  });
});

router.post('/add', async function(req, res) {
  const ret = await courseModel.add(req.body);
  console.log(ret)  
  res.redirect(`/teacher/course/${ret._id}`);
})


router.get('/:id', async function (req, res) {
  const id = req.params.id;
  const result = await courseModel.singleByID(id);
  const resultCategory = await categoryModel.all();

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
    });
  }
});

router.post('/patch', async function(req, res) {
  const ret = await courseModel.patch(req.body);
  res.redirect(req.headers.referer);
})


module.exports = router;
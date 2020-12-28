const router = require('express').Router();
const multer = require('multer');

const path = require('path');
const fileUtils = require('../../utils/file');

const categoryModel = require('../../models/categories.model');
const courseModel = require('../../models/courses.model');


router.get('/add', async function(req, res) {
  const result = await categoryModel.all();

  res.render('vwCourses/add', {
    layout: 'special_user.layout.hbs',
    categories: result
  });
});

router.post('/add', async function(req, res) {
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
  })
  res.redirect(req.headers.referer);
})

module.exports = router;
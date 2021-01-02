const router = require('express').Router();
const chapterModel = require('../../models/chapters.model');

const fileUtils = require('../../utils/file');
const multer = require('multer');
const url = require('url');
const path = require('path');

router.post('/patch', async function(req, res) {
  const chapterId = req.body._id;
  const courseId = req.body.Course;

  const result = await chapterModel.patchDetails(req.body);
  res.redirect(url.format({
    pathname: `/teacher/course/${courseId}/${chapterId}`,
    query: {
      message: null
    }
  }));
});

router.post('/delete', async function(req, res) {
  const chapterId = req.body._id;

  //Get deleting chapter
  const chapter = await chapterModel.singleByID(chapterId);
  const courseId = chapter.Course;
  let link = chapter.VideoLink;
  const result = await chapterModel.delete(chapter);

  //Deleting chapter video if exists && delete success
  if (link !== null && result.ok === 1) {
    link = link.replace('/p/', './public/');
    fileUtils.unlink(link);
  }

  res.redirect(url.format({
    pathname: `/teacher/course/${courseId}`
  }));
});

router.post('/video', function(req, res) {
  let filename = null;

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, fileUtils.tmpVidPath)
    },
    filename: function (req, file, cb) {
      filename = file.originalname;
      cb(null, file.originalname)
    }
  });

  const upload = multer({storage});
  upload.single('vidChapter')(req, res, async function(err) {
    console.log("Video started uploading");
    const id = req.body._id;

    //TODO: Check valid
    if (err) {
      //console.log('img upload failed')
      console.log(err);
      res.redirect(req.headers.referer);
    }
    else {
      const ret = await chapterModel.singleByID(id); //Check ID existence
      if (ret !== null) {
        console.log()
        const tmpPath = `${fileUtils.tmpVidPath}${filename}`;
        const fileDirPath = path.join(`${fileUtils.coursesVidPath}`, `${ret.Course}/`);
        const filePath = path.join(fileDirPath, `${ret._id}${path.extname(filename)}`);
        const link = `/p/vids/courses/${ret.Course}/${ret._id}${path.extname(filename)}`;

        fileUtils.newdir(fileDirPath);
        fileUtils.move(
          tmpPath, 
          filePath
        );

        const result = await chapterModel.patchVideoLink(ret, link);
        res.redirect(`/teacher/course/${ret.Course}/${ret._id}`);
      }
      else {
        //Id not exists
        res.redirect(req.headers.referer);
      }
    }
  });
});

module.exports = router;
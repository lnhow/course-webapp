const router = require('express').Router();
const courseModel = require('../../models/courses.model');

router.get('/', async function(req, res) {
  const ret = await courseModel.all();
  console.log(ret);
  const result = [{
      CourseName: "Lập trình android cơ bản",
      TinyDes: "Những gì bạn cần để bắt đầu lập trình Android",
      FullDes: "",
      RatingAverage: 0,
      RatingCount: 0,
      RegisterCount: 0,
      Price: 0,
      Discount: 0,
      LastUpdate: "2020/12/27 15:50",
      Teacher: {
        _id: "0123",
        Name: "NVA",
      },
      Category: {
        _id: "0145",
        CatName: "IT"
      },
      Status: 0
    },
    {
      CourseName: "Lập trình android cơ bản",
      TinyDes: "Những gì bạn cần để bắt đầu lập trình Android",
      FullDes: "",
      RatingAverage: 0,
      RatingCount: 0,
      RegisterCount: 0,
      Price: 0,
      Discount: 0,
      LastUpdate: "2020/12/27 15:50",
      Category: null,
      Teacher: {
        _id: "0123",
        Name: "NVA",
      },
      Status: 0
    },
  ];

  res.render('vwCourses/admin_courses', {
    layout: 'special_user.layout.hbs',
    courses: ret,
  });
});

module.exports = router;
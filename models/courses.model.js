const mongoose = require('mongoose');
const config = require('../config/config.json');
const datetime = require('../utils/datetime');

const categoryModel = require('./categories.model');

const courseSchema = new mongoose.Schema({
  CourseName: { type: String, required: true},
  TinyDes: String,
  FullDes: String,
  Curriculum: String,
  ViewCount: Number,
  RatingAverage: 0,
  RatingCount: 0,
  RegisterCount: 0,
  Price: 0,
  Discount: 0,
  IsDisabled: false,
  LastUpdate: String,
  Category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "categories"
  },
  Teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  Status: Boolean,
});

//courseSchema.index({CourseName: 'text'});
const Course = mongoose.model('courses', courseSchema);

module.exports = {
  //With detail
  singleByID: async function(id) {
    let result = null;

    if (! mongoose.Types.ObjectId.isValid(id)) {
      return result;
    }

    result = await Course.aggregate([
      { $match: {
          _id: mongoose.Types.ObjectId(id)
        }
      },
      { $lookup: {
          from: categoryModel.collectionName,
          localField: 'Category',
          foreignField: '_id',
          as: 'Category'
        }
      },
      { $lookup: {  //JOIN TEACHER
          from: 'users',
          localField: 'Teacher',
          foreignField: '_id',
          as: 'Teacher'
        }
      },
      { $unwind: '$Category'},
      { $unwind: {
          path:'$Teacher', preserveNullAndEmptyArrays: true
        }
      },
    ]);

    if (!result) { //err
      return null;
    }

    result = result[0];
    result.LastUpdate = datetime.FormatDate(result.LastUpdate);

    return result;
  },
  exists: async function(id) {
    let result = await Course.countDocuments({
      '_id': mongoose.Types.ObjectId(id),
    });

    return result > 1;
  },

  all: async function(filterId) {
    const aggregateArr = [
      { $lookup: {
          from: categoryModel.collectionName,
          localField: 'Category',
          foreignField: '_id',
          as: 'Category'
        }
      },
      { $lookup: {
          from: 'users',
          localField: 'Teacher',
          foreignField: '_id',
          as: 'Teacher'
        }
      },
      { $unwind: "$Teacher"},
      { $project: {
          _id: '$_id',
          CourseName: '$CourseName',
          RatingAverage: '$RatingAverage',
          RatingCount: '$RatingCount',
          RegisterCount: '$RegisterCount',
          Price: '$Price',
          Discount: '$Discount',
          Category: '$Category',
          Teacher: {
            _id: '$Teacher._id',
            Name: '$Teacher.Name'
          },
          LastUpdate: '$LastUpdate',
          Status: '$Status',
          IsDisabled: '$IsDisabled'
        }
      }  
    ];

    if (filterId !== 0) {//Filter by cat => add match on top of aggregateArr
      if (
        !mongoose.Types.ObjectId.isValid(filterId)
        || filterId !== String(new mongoose.Types.ObjectId(filterId))
      ) {//Filter non valid ids
        return [];
      }
      aggregateArr.unshift({
        $match: {
          'Category': mongoose.Types.ObjectId(filterId),
        }
      })
    }
    let result = await Course.aggregate(aggregateArr).unwind('$Category');

    //Format day time from DB's ISO string
    result.forEach(row => {
      row.LastUpdate = (datetime.FormatDate(row.LastUpdate));
    });

    return result;
  },
  allByTeacher: async function(TeacherUID) {
    let result = await Course.aggregate([
      { $match: {
          Teacher: mongoose.Types.ObjectId(TeacherUID),
        }
      },
      { $lookup: {
          from: categoryModel.collectionName,
          localField: 'Category',
          foreignField: '_id',
          as: 'Category'
        }
      },
      { $lookup: {  //JOIN TEACHER
          from: 'users',
          localField: 'Teacher',
          foreignField: '_id',
          as: 'Teacher'
        }
      },
      { $unwind: '$Category'},
      { $unwind: {
          path:'$Teacher', preserveNullAndEmptyArrays: true
        }
      },
      { $project: {
          _id: '$_id',
          CourseName: '$CourseName',
          RatingAverage: '$RatingAverage',
          RatingCount: '$RatingCount',
          RegisterCount: '$RegisterCount',
          Price: '$Price',
          Discount: '$Discount',
          Category: '$Category',
          Teacher: {
            Name: '$Teacher.Name'
          },
          LastUpdate: '$LastUpdate',
          Status: '$Status',
          IsDisabled: '$IsDisabled'
        }
      }  
    ]).unwind('$Category');

    //Format day time from DB's ISO string
    result.forEach(row => {
      row.LastUpdate = (datetime.FormatDate(row.LastUpdate));
    });

    return result;
  },

  byCatMinus: async function(catID, courseID, findlimit) {
    let category = await categoryModel.singleCategory(catID);

    if (category[0].CatParent === null) {
      //The category requested is a main category
      //then have to find courses in sub categories
      category = await categoryModel.subcatsOfCategory(catID);
    }
    
    //Convert category into array of _id only for $in
    category = category.map((cat) => mongoose.Types.ObjectId(cat._id));

    let result = await Course.aggregate([
      { $match: {
          'Category': { $in: category},
          '_id': {$ne: mongoose.Types.ObjectId(courseID)},
          'IsDisabled': {$ne: true}
        }
      },
      { $lookup: {
          from: categoryModel.collectionName,
          localField: 'Category',
          foreignField: '_id',
          as: 'Category'
        }
      },
      { $lookup: {  //JOIN TEACHER
          from: 'users',
          localField: 'Teacher',
          foreignField: '_id',
          as: 'Teacher'
        }
      },
      { $unwind: '$Category'},
      { $unwind: {
          path:'$Teacher', preserveNullAndEmptyArrays: true
        }
      },
      { $project: {
          _id: '$_id',
          CourseName: '$CourseName',
          RatingAverage: '$RatingAverage',
          RatingCount: '$RatingCount',
          Price: '$Price',
          Discount: '$Discount',
          Category: '$Category',
          Teacher: {
            Name: '$Teacher.Name'
          }
        }
      },
      { $limit: findlimit}
    ]).unwind('$Category');

    return result;
  },
  byCat: async function(catID, skip) {
    let category = await categoryModel.singleCategory(catID);

    if (category[0].CatParent === null) {
      //The category requested is a main category
      //then have to find courses in sub categories
      category = await categoryModel.subcatsOfCategory(catID);
    }
    
    //Convert category into array of _id only for $in
    category = category.map((cat) => mongoose.Types.ObjectId(cat._id));

    let result = await Course.aggregate([
      { $match: {'Category': { $in: category}} },
      { $lookup: {
          from: categoryModel.collectionName,
          localField: 'Category',
          foreignField: '_id',
          as: 'Category'
        }
      },
      { $lookup: {  //JOIN TEACHER
          from: 'users',
          localField: 'Teacher',
          foreignField: '_id',
          as: 'Teacher'
        }
      },
      { $unwind: '$Category'},
      { $unwind: {
          path:'$Teacher', preserveNullAndEmptyArrays: true
        }
      },
      { $project: {
          _id: '$_id',
          CourseName: '$CourseName',
          RatingAverage: '$RatingAverage',
          RatingCount: '$RatingCount',
          Price: '$Price',
          Discount: '$Discount',
          Category: '$Category',
          Teacher: {
            Name: '$Teacher.Name'
          },
          IsDisabled: '$IsDisabled'
        }
      },
      { $skip: skip },
      { $limit: config.app.pagination.limit}
    ]);


    return result;
  },
  countByCat: async function(catID) {
    //Check if category is main category
    let category = await categoryModel.singleCategory(catID);

    if (category[0].CatParent === null) {
      //The category requested is a main category
      //then have to find courses in sub categories
      category = await categoryModel.subcatsOfCategory(catID);
    }
    
    //Convert category into array of _id only for $in
    category = category.map((cat) => mongoose.Types.ObjectId(cat._id));

    let result = await Course.countDocuments({
      Category: {$in: category},
    });

    return result;
  },

  search: async function(keyword, sortOption, skip) {
    let sortObj = null;

    switch(sortOption) {
      case 'review_Inc':
        sortObj = {'RatingAverage': 1};
        break;
      case 'review_Desc':
        sortObj = {'RatingAverage': -1};
        break;
      case 'price_Inc':
        sortObj = {'Price': 1};
        break;
      case 'price_Desc':
        sortObj = {'Price': -1};
        break;
      default:
        sortObj = {'_id': 1};
    }

    let result = await Course.aggregate([
      { $match: {
          $text: { $search: keyword },
          'IsDisabled': {$ne: true}
        } 
      },
      { $lookup: {  //JOIN CATEGORY
          from: categoryModel.collectionName,
          localField: 'Category',
          foreignField: '_id',
          as: 'Category'
        }
      },
      { $lookup: {  //JOIN TEACHER
          from: 'users',
          localField: 'Teacher',
          foreignField: '_id',
          as: 'Teacher'
        }
      },
      { $unwind: '$Category'},
      { $unwind: {
          path:'$Teacher', preserveNullAndEmptyArrays: true
        }
      },
      { $project: {   //Optimized for display in list
          _id: '$_id',
          CourseName: '$CourseName',
          RatingAverage: '$RatingAverage',
          RatingCount: '$RatingCount',
          Price: '$Price',
          Discount: '$Discount',
          Category: '$Category',
          Teacher: {
            Name: '$Teacher.Name'
          }
        }
      },
      { $sort: sortObj},
      { $facet:{  //Group count all result in 1 branch and skip limit in the other
        "stage1" : [ {"$group": {_id: null, count: {$sum: 1}}} ],
        "stage2" : [ {"$skip": skip}, {"$limit": config.app.pagination.limit} ]
      }},
      { $unwind: "$stage1" },
      { $project:{
          count: "$stage1.count",
          results: "$stage2"
        }
      }
    ]);

    //Output found: [{count: (num), results: [...]}] else []
    if (result.length < 1) {
      result.push({count: 0, result: []});
    }

    return result[0];
  },

  get: async function(sortObject, findlimit) {
    let result = await Course.aggregate([
      { $match: {
         'IsDisabled': {$ne: true}
        }
      },
      { $lookup: {
          from: categoryModel.collectionName,
          localField: 'Category',
          foreignField: '_id',
          as: 'Category'
        }
      },
      { $lookup: {  //JOIN TEACHER
          from: 'users',
          localField: 'Teacher',
          foreignField: '_id',
          as: 'Teacher'
        }
      },
      { $unwind: '$Category'},
      { $unwind: {
          path:'$Teacher', preserveNullAndEmptyArrays: true
        }
      },
      {$sort: sortObject},
      {$limit: findlimit},
      { $project: {
          _id: '$_id',
          CourseName: '$CourseName',
          RatingAverage: '$RatingAverage',
          RatingCount: '$RatingCount',
          Price: '$Price',
          Discount: '$Discount',
          Category: '$Category',
          Teacher: {
            Name: '$Teacher.Name'
          }
        }
      },
    ]);

    return result;
  },
  registerCountByCat: async function(findlimit) {
    let result = await Course.aggregate([
      { $lookup: {
          from: categoryModel.collectionName,
          localField: 'Category',
          foreignField: '_id',
          as: 'Category'
        }
      },
      { $unwind: '$Category'},
      { $group: {
          _id: '$Category._id',
          CatName: {$first: '$Category.CatName'},
          RegisterCount: {$sum: '$RegisterCount'}
        }
      },
      { $sort: {RegisterCount: -1}},
      { $limit: findlimit}
    ]);

    return result;
  },

  add: async function(entity) {
    return await new Course({
      CourseName: entity.CourseName,
      TinyDes: entity.TinyDes,
      FullDes: entity.FullDes,
      Curriculum: entity.Curriculum,
      ViewCount: 0,
      RatingAverage: 0,
      RatingCount: 0,
      RegisterCount: 0,
      Price: parseInt(entity.Price),
      Discount: 0,
      LastUpdate: datetime.ISODateNow(), //Save to db as ISO String
      Category: mongoose.Types.ObjectId(entity.CatID),
      Teacher: mongoose.Types.ObjectId(entity.Teacher),
      Status: false
    }).save();
  },
  patch: async function(entity) {
    const condition = entity._id;
    delete entity._id;
    entity.LastUpdate = datetime.ISODateNow();
    entity.Price = parseInt(entity.Price);
    entity.Discount = parseInt(entity.Discount);
    entity.Status = (entity.Status === 'true');

    return await Course.updateOne({'_id': condition}, {$set: entity}, function(err){
      if (err) {
        console.log(err);
      }
    });
  },
  patchLastUpdate: async function(courseID) {
    return await Course.updateOne({
      _id: mongoose.Types.ObjectId(courseID)
    }, {
      $set: {
        LastUpdate: datetime.ISODateNow()
      }
    });
  },
  patchRegisterCount: async function(courseID) {
    return await Course.updateOne({
      _id: mongoose.Types.ObjectId(courseID)
    }, {
      $inc: {
        RegisterCount: 1
      }
    });
  },
  patchRating: async function(courseID) {
    let course = await Course.aggregate([
      { $match: {
        _id: mongoose.Types.ObjectId(courseID)
      }},
      { $lookup: {
        from: 'users_courses',
        localField: '_id',
        foreignField: 'Course',
        as: 'register'
      }},
      { $unwind: '$register' },
      { $match: {
        'register.rating': {$ne: null}
      }},
      { $group: {
        _id: '$_id',
        total: {$sum: '$register.rating.score'},
        count: {$sum: 1}
      }}
    ]);
    course = course[0]; //result from aggregate is array
    return await Course.updateOne({
      _id: mongoose.Types.ObjectId(courseID)
    }, {
      $set: {
        RatingAverage: (course.total /course.count),
        RatingCount: course.count
      }
    });
  },
  incViewCount: async function(courseID) {
    return await Course.updateOne({
      _id: mongoose.Types.ObjectId(courseID)
    }, {
      $inc: {
        ViewCount: 1
      }
    });
  },

  toggleDisable: async function(id) {
    const condition = id;

    const course = await Course.findOne({
      _id: mongoose.Types.ObjectId(condition)
    }); //Really dump, but... the simpliest way
    let toggle = (course.IsDisabled !== true);
    const result = await Course.updateOne({
      _id: course._id
    }, {
      $set: { IsDisabled: toggle }
    });

    if (result.ok === 1) {
      return true;
    }
    return false;
  },

  // delete: async function(id) {
  //   const condition = id;

  //   //Delete this course
  //   //Delete all chapter in this course
  //   const ret = await require('./chapters.model').deleteAllInCourse(condition);
  //   console.log(ret);

  //   if (!ret.ok) {
  //     return null;
  //   }

  //   return await Course.deleteOne({
  //     '_id': condition,
  //   }, function(err){
  //     if (err) {
  //       console.log(err);
  //     }
  //   });
  // },
}
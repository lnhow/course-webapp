const mongoose = require('mongoose');
const config = require('../config/config.json');
const datetime = require('../utils/datetime');

const categoryModel = require('./categories.model');

const courseSchema = new mongoose.Schema({
  CourseName: { type: String, required: true},
  TinyDes: String,
  FullDes: String,
  Curriculum: String,
  RatingAverage: 0,
  RatingCount: 0,
  RegisterCount: 0,
  Price: 0,
  Discount: 0,
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
      {
        $match: {
          _id: mongoose.Types.ObjectId(id)
        }
      },
      {
        $lookup: {
          from: categoryModel.collectionName,
          localField: 'Category',
          foreignField: '_id',
          as: 'Category'
        }
      }
    ]).unwind('$Category');

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

  all: async function() {
    let result = await Course.aggregate([
      {
        $lookup: {
          from: categoryModel.collectionName,
          localField: 'Category',
          foreignField: '_id',
          as: 'Category'
        }
      },
      {
        $project: {
          _id: '$_id',
          CourseName: '$CourseName',
          RatingAverage: '$RatingAverage',
          RatingCount: '$RatingCount',
          RegisterCount: '$RegisterCount',
          Price: '$Price',
          Discount: '$Discount',
          Category: '$Category',
          Teacher: '$Teacher',
          LastUpdate: '$LastUpdate',
          Status: '$Status',
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
          '_id': {$ne: mongoose.Types.ObjectId(courseID)}
        }
      },
      { $lookup: {
          from: categoryModel.collectionName,
          localField: 'Category',
          foreignField: '_id',
          as: 'Category'
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
          Teacher: '$Teacher'
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
      {
        $match: {'Category': { $in: category}}
      },
      {
        $lookup: {
          from: categoryModel.collectionName,
          localField: 'Category',
          foreignField: '_id',
          as: 'Category'
        }
      },
      {
        $project: {
          _id: '$_id',
          CourseName: '$CourseName',
          RatingAverage: '$RatingAverage',
          RatingCount: '$RatingCount',
          Price: '$Price',
          Discount: '$Discount',
          Category: '$Category',
          Teacher: '$Teacher'
        }
      },
      { $skip: skip },
      { $limit: config.app.pagination.limit}
    ]).unwind('$Category');

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

  add: async function(entity) {
    return await new Course({
      CourseName: entity.CourseName,
      TinyDes: entity.TinyDes,
      FullDes: entity.FullDes,
      Curriculum: entity.Curriculum,
      RatingAverage: 0,
      RatingCount: 0,
      RegisterCount: 0,
      Price: parseInt(entity.Price),
      Discount: 0,
      LastUpdate: datetime.ISODateNow(), //Save to db as ISO String
      Category: mongoose.Types.ObjectId(entity.CatID),
      Teacher: null,
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

    return await Course.updateOne({'_id': condition}, entity, function(err){
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

  delete: async function(id) {
    const condition = id;

    //TODO: Delete all chapter in this course
    const ret = await require('./chapters.model').deleteAllInCourse(condition);
    console.log(ret);

    if (!ret.ok) {
      return null;
    }

    return await Course.deleteOne({
      '_id': condition,
    }, function(err){
      if (err) {
        console.log(err);
      }
    });
  },
}
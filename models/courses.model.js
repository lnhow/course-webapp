const mongoose = require('mongoose');
const config = require('../config/config.json');
const datetime = require('../utils/datetime');

const categoryModel = require('./categories.model');

const courseSchema = new mongoose.Schema({
  ImgLink: String,
  CourseName: { type: String, required: true},
  TinyDes: String,
  FullDes: String,
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
  Completed: Boolean,
});

//courseSchema.index({CourseName: 'text'});
const Course = mongoose.model('courses', courseSchema);

module.exports = {
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
    ]).unwind('$Category');

    //Format day time from DB's ISO string
    result.forEach(row => {
      row.LastUpdate = (datetime.FormatDate(row.LastUpdate));
    });

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
        $match: {
          'Category': { $in: category}
        }
      },
      {
        $lookup: {
          from: categoryModel.collectionName,
          localField: 'Category',
          foreignField: '_id',
          as: 'Category'
        }
      },
      { $skip: skip },
      { $limit: config.app.pagination.limit}
    ]).unwind('$Category');

    //Format day time from DB's ISO string
    result.forEach(row => {
      row.LastUpdate = (datetime.FormatDate(row.LastUpdate));
    });

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
  del: async function(entity) {
    const condition = entity.CatID;

    //TODO: Delete all chapter in this course

    return await Course.deleteOne({
      '_id': condition,
    }, function(err){
      if (err) {
        console.log(err);
      }
    });
  },
}
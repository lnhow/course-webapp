const mongoose = require('mongoose');
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
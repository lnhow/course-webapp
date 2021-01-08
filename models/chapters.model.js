//Course chapter
const mongoose = require('mongoose');
const CourseModel = require('./courses.model');

const chapterSchema = new mongoose.Schema({
  ChapterName: { type: String, required: true},
  Previewable: Boolean,
  VideoLink: String,
  Course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "courses"
  },
});

const Chapter = mongoose.model('chapters', chapterSchema);

module.exports = {
  allInCourse: async function(courseID) {
    return await Chapter.aggregate([
      {
        $match:{
          Course: mongoose.Types.ObjectId(courseID),
        }
      }
    ]);
  },
  singleByID: async function(chapterID) {
    const result = await Chapter.aggregate([
      {
        $match:{
          _id: mongoose.Types.ObjectId(chapterID),
        }
      }
    ]);
    return result[0];
  },
  //Order: Position of chapter in course, orderID > 0
  singleInCourse: async function(courseID, order) {
    if (order <= 0) {
      return null;
    }

    const result = await Chapter.aggregate([
      { $match: {
          Course: mongoose.Types.ObjectId(courseID)
      }}, 
      { $facet:{  //Group count all result in 1 branch and skip limit in the other
        "stage1" : [ {"$group": {_id: null, count: {$sum: 1}}} ],
        "stage2" : [ {"$skip": order - 1}, {"$limit": 1} ]  //get single chapter by limit 1
      }},
      { $unwind: '$stage1'},
      { $unwind: '$stage2'},
      { $lookup: {
        from: 'courses',
        localField: 'stage2.Course',
        foreignField: '_id',
        as: 'stage2.Course'
      }},
      { $unwind: '$stage2.Course'},
      { $project: {
        count: '$stage1.count',
        Chapter: {
          _id: '$stage2._id',
          ChapterName: '$stage2.ChapterName',
          VideoLink: '$stage2.VideoLink',
          Course: {
            _id: '$stage2.Course._id',
            CourseName: '$stage2.Course.CourseName'
          }
        }
      }}
    ]);

    if (result.length > 0) {
      return result[0];
    } //else
    return null;
  },


  add: async function(entity) {
    let result = await new Chapter({
      ChapterName: entity.ChapterName,
      Previewable: false,
      VideoLink: null,
      Course: mongoose.Types.ObjectId(entity.Course)
    }).save(async function(err) {
      if (err) {
        console.log(err);
      }
      else {
        await CourseModel.patchLastUpdate(entity.Course);
      }
    });

    return result;
  },

  patchDetails: async function(entity) {
    const condition = entity._id;
    let result = await Chapter.updateOne({'_id': condition}, {
      $set: {
        ChapterName: entity.ChapterName,
        Previewable: entity.Previewable,
      }
    },async function(err) {
      if (err) {
        console.log(err);
      }
      else {
        await CourseModel.patchLastUpdate(entity.Course);
      }
    });

    return result;
  },
  patchVideoLink: async function(chapter, link) {
    const condition = chapter._id;
    let result = await Chapter.updateOne({'_id': condition}, {
      $set: {
        VideoLink: link,
      }
    },async function(err) {
      if (err) {
        console.log(err);
      }
      else {
        await CourseModel.patchLastUpdate(chapter.Course);
      }
    });

    return result;
  },

  patchVideoLink: async function(chapter, link) {
    const condition = chapter._id;
    let result = await Chapter.updateOne({'_id': condition}, {
      $set: {
        VideoLink: link,
      }
    },async function(err) {
      if (err) {
        console.log(err);
      }
      else {
        await CourseModel.patchLastUpdate(chapter.Course);
      }
    });

    return result;
  },

  delete: async function(chapter) {
    const condition = chapter._id;
    const courseId = chapter.Course;
    let result = await Chapter.deleteOne({'_id': condition}, async function(err) {
      if (err) {
        console.log(err);
      }
      else {
        await CourseModel.patchLastUpdate(courseId);
      }
    });

    return result;
  },
  delete: async function(chapter) {
    const condition = chapter._id;
    const courseId = chapter.Course;
    let result = await Chapter.deleteOne({'_id': condition}, async function(err) {
      if (err) {
        console.log(err);
      }
      else {
        await CourseModel.patchLastUpdate(courseId);
      }
    });

    return result;
  },
  deleteAllInCourse: async function(courseId) {
    let result = await Chapter.deleteMany({'Course': mongoose.Types.ObjectId(courseId)}, function(err) {
      if (err) {
        console.log(err);
      }
    });

    return result;
  }

}
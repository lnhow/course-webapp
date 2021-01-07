const mongoose = require('mongoose');
const UserModel = require('./users.model');
const coursesModel = require('./courses.model');
const { value } = require('numeral');

const User_CourseSchema =  new mongoose.Schema({
  Course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "courses"
  },
  User: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  chapter: Number,
  favorite: Boolean,
  rating: {
    score: Number,
    feedback: String
  },
})

const users_course = mongoose.model('users_course', User_CourseSchema);
module.exports = {
  //Check if this user already registered this course or not
  singleUserCourse: async function(accountUID, courseID) {
    let result = await users_course.aggregate([
      { $match: {
          User: mongoose.Types.ObjectId(accountUID),
          Course: mongoose.Types.ObjectId(courseID)
        }
      }
    ]);

    if (result.length > 0) {
      result = result[0];
    }
    else {
      result = null;
    }

    return result;
  },
  //Get all course this user registered
  allByUserID: async function(userId){
    let course = await users_course.aggregate([
      { $match: {
          User: mongoose.Types.ObjectId(userId),
        }
      }
    ]);

    return result;
  },

  //List all feedback for the course
  listFeedback: async function (courseId) {
    let feedbacks = await users_course.aggregate([
      { $match: {
        Course: mongoose.Types.ObjectId(courseId),
        rating: {$ne : null}
      }},
      { $lookup: {
        from: 'users',
        localField: 'User',
        foreignField: '_id',
        as: 'User'
      }},
      { $unwind: '$User'},
      { $project: {
        User: '$User.Name',
        rating: '$rating'
      }}
    ]);

    return feedbacks;
  },

  register: async function(userid, courseid){
    return await new users_course({
      Course: courseid,
      User: userid,
      chapter: 0,
      favorite: 0,
      rating: null,//ko tính vào average nếu = null
    }).save(async function(err) {
      if (err) {
        console.log(err);
      }
      else {
        await coursesModel.patchRegisterCount(courseid);
      }
    });
  },
  feedback: async function(userId, courseId, entity) {
    const result = await users_course.updateOne({
      User: mongoose.Types.ObjectId(userId),
      Course: mongoose.Types.ObjectId(courseId)
    }, {
      $set: {
        rating: {
          score: entity.score,
          feedback: entity.feedback
        }
      }
    });

    let finalResult = null;
    if (result.ok === 1) {
      finalResult = await coursesModel.patchRating(courseId);
    }

    if (finalResult === 1) {
      return true;
    }
    return false;
  },
  toggleFavorite: async function(userId, courseId) {
    const course = await users_course.findOne({
      User: mongoose.Types.ObjectId(userId),
      Course: mongoose.Types.ObjectId(courseId)
    }); //Really dump, simpliest way
    let newfavorite = !course.favorite;
    const result = await users_course.updateOne({
      _id: course._id
    }, {
      $set: { favorite: newfavorite}
    });

    if (result.ok === 1) {
      return true;
    }
    return false;
  },

}


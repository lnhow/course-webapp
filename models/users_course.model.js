const mongoose = require('mongoose');
const UserModel = require('./users.model');
const CourseModel = require('./course.model');
const coursesModel = require('./courses.model');

const User_CourseSchema =  new mongoose.schema({
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
    rating: Number,
})

const users_course = mongoose.model('users_course', User_CourseSchema);
module.exports = {
    allByUserID: async function(id){//truyền vào UserID
        let course = await users_course.aggregate([
            {
                $match: {
                    User: mongoose.Types.ObjectId(id),
                }
            }
        ]).unwind('$Course');
        let result = await coursesModel.singleByID(course);
    },
    favoriteAvg: async function(id){//Truyền vào CourseID
        let result = await users_course.aggregate([
            {
                $match: {
                    Course: mongoose.Types.ObjectId(id),
                },
                $group: {
                    _id: "$User",
                    avgRating: {$avg: "$rating"},
                }
            }
        ])
        return result;
    },
    add: async function(userid, courseid){
        return await new users_course({
            Course: courseid,
            User: userid,
            chapter: 0,
            favorite: 0,
            rating: null,//ko tính vào average nếu = null
        }).save();
    }
}


const mongoose = require('mongoose');
const UserModel = require('./users.model');
const CourseModel = require('./course.model');

const User_CourseSchema =  new mongoose.schema({
    Course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses"
      },
    User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    chapter: int,
})

const users_course = mongoose.model('users_course', User_CourseSchema);
module.exports = users_course


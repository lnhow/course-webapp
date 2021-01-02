const mongoose = require('mongoose');
//not done
const userSchema = new mongoose.schemna({
    username: {type: String, required : true},
    password: {type: String, required : true}
});

const User = mongoose.model('user', userSchema)
module.exports = User
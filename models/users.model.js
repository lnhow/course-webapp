const mongoose = require('mongoose');
//not done
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
    username: {type: String, required : true},
    password: {type: String, required : true},
    email: String
});

userSchema.methods.encryptPassword = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.password);
}


const User = mongoose.model('user', userSchema);
module.exports = User
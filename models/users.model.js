const mongoose = require('mongoose');
//not done
const bcrypt = require('bcryptjs');
const e = require('express');
const userSchema = new mongoose.Schema({
    Email: {type: String, required : true},
    Password: {type: String, required : true},
    Permission: Number,//0 là admin, 1 là giáo viên, 2 là học viên
    Name: String,
});

userSchema.methods.encryptPassword = function(Password){
    return bcrypt.hashSync(Password, bcrypt.genSaltSync(5), null);
};

userSchema.methods.validPassword = function(Password){
    return bcrypt.compareSync(Password, this.Password);
};



const User = mongoose.model('user', userSchema);
module.exports = {
    add: async function(entity){
        return await new User({
            Password: entity.Password,
            Email: entity.Email,
            Permission: entity.Permission,
            Name: entity.Name
        }).save()
    },
    singleByEmail: async function(email){
        let result = await User.aggregate([
            {
                $match:{
                    Email: email
                }
            }
        ])
        if(result.length >= 1)
            {return result;}
        else
            {return null;}
    }
}
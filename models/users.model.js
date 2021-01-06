  const mongoose = require('mongoose');
//not done
const bcrypt = require('bcryptjs');
const e = require('express');
const userSchema = new mongoose.Schema({
  Email: {type: String, required : true},
  Password: {type: String, required : true},
  Permission: Number,//0 là admin, 1 là giáo viên, 2 là học viên
  Name: String,
  SecretOTP: {type: Number},   //For register
  About: String,      //Teacher description
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
      Permission: parseInt(entity.Permission),
      Name: entity.Name,
      About: entity.About,
      SecretOTP: entity.SecretOTP
    }).save()
  },
  singleByEmail: async function(email){
    let result = await User.aggregate([
    {
      $match:{
        Email: email
      }
    }
    ]);
    if(result.length >= 1)
      {return result;}
    else
      {return null;}
  },
  singleById: async function(accountId){
    let result = await User.aggregate([
    { $match:{
        _id: mongoose.Types.ObjectId(accountId)
      }
    }
    ]);

    if (result.length > 0) {
      return result[0];
    }
    
    return null;  
  },

  allNonAdmin: async function() {
    //Get all user that is not admin
    let result = await User.aggregate([
      { $match:{
          Permission: {$ne: 0}
        }
      }
    ]);
      
    return result;
  },
  patchInfo: async function(account) {
    const condition = account._id;

    let result = await User.updateOne({
      '_id': mongoose.Types.ObjectId(condition)
    }, {
      $set: {
        Name: account.Name,
        Email: account.Email,
        Permission: parseInt(account.Permission),
        About: account.About
      }
    });

    if (result.ok === 1) {
      return true;
    }

    return false;
  },
  patchPassword: async function(account) {
    const condition = account._id;

    let result = await User.updateOne({
      '_id': mongoose.Types.ObjectId(condition)
    }, {
      $set: {
        Password: account.Password
      }
    });

    if (result.ok === 1) {
      return true;
    }

    return false;
  },
  del: async function(accountId) {
    const condition = accountId;
    
    let result = await User.deleteOne({
      '_id': mongoose.Types.ObjectId(condition)
    });

    if (result.ok === 1) {
      return true;
    }

    return false;
  }
}
const fs = require('fs');
const config = require('../config/config.json');

module.exports ={
  tmpImgPath: config.app.tmpImgPath,
  coursesImgPath: config.app.coursesImgPath,
  move: function(oldPath, newPath) {
    fs.rename(oldPath, newPath, (err)=>{
      if(err) {
        console.log(err);
      }
    })
  }
}
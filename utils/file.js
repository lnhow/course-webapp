const fs = require('fs');
const config = require('../config/config.json');

module.exports ={
  tmpImgPath: config.app.tmpImgPath,
  coursesImgPath: config.app.coursesImgPath,
  tmpVidPath: config.app.tmpVidPath,
  coursesVidPath: config.app.coursesVidPath,

  //Move a file from oldPath to newPath
  move: function(oldPath, newPath) {
    fs.rename(oldPath, newPath, (err)=>{
      if(err) {
        console.log(err);
      }
    })
  },
  newdir: function(path) {
    if(!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
  },
  exists: function(path) {
    return fs.existsSync(path);
  }
}
const mongoose = require('mongoose');

const catSchema = new mongoose.Schema({
  CatParent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "categories"
  },  //For subcats
  CatName: { type: String, required: true }
});

catSchema.method('toClient', function() {
  var obj = this.toObject();

  //Rename fields
  obj.CatID = obj._id;
  delete obj._id;

  return obj;
});

const Category = mongoose.model('categories', catSchema);

module.exports = {
  all: async function() {
    return await Category.aggregate([
      {
        $match:{
          CatParent: null
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "CatParent",
          as: 'SubCats'
        }
      },
      {
        $project: {
          'CatID': '$_id',
          'CatName': '$CatName',
          'SubCats': {
            '$map': {
              'input': '$SubCats',
              'in': {
                'CatID': '$$this._id',
                'CatName': '$$this.CatName'
              }
            }
          }
        }
      }
    ]);
  },

  add: async function(entity) {
    return await new Category({
      CatParent: entity.CatParent,
      CatName: entity.CatName
    }).save((err)=>{
      if (err) {
        console.log(err);
      }
    });
  }
}
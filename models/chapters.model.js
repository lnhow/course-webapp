//Course chapter
const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  ChapterName: { type: String, required: true},
  Description: String,
  Body: String,
  Course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "courses"
  },
});

const Chapter = mongoose.model('chapters', chapterSchema);
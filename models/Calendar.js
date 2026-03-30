const mongoose = require('mongoose');

const CalendarWorkSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  gender: { type: String, enum: ['nam', 'nữ'] },
  start: { type: Date, required: true },
  end: { type: Date, required: true }
});

module.exports = mongoose.model('CalendarWork', CalendarWorkSchema);
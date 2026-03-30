const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  shift: { type: String, required: true },
  day: { type: String, required: true },
  employees: [{
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    gender: String
  }]
});

ScheduleSchema.index({ shift: 1, day: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', ScheduleSchema);
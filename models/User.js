const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  subId: { type: Number, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  role: {
    _id: mongoose.Schema.Types.ObjectId,
    role: String,
    subRole: Number
  },
  gender: { type: String, required: true },
  name: { type: String, required: true }
});

module.exports = mongoose.model('User', UserSchema);
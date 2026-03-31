const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
    role: { type: String, enum: ['manager', 'user'], default: 'user' },
    subRole: { type: Number, default: 2 }
});

module.exports = mongoose.model('Role', RoleSchema);
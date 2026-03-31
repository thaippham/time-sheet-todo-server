const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/get-all-user', verifyToken, async (req, res) => {
  try {
    const users = await User.find({ 'role.role': 'user' })
                  .select('_id name gender role');
    if (users.length === 0) {
      return res.status(404).json({ message: 'Danh sách trống!' });
    }
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách', error });
  }
});

module.exports = router;
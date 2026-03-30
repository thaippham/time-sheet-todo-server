const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { SECRET_KEY } = require('../middleware/auth.middleware');
const router = express.Router();
const bcrypt = require('bcryptjs');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });

    const token = jwt.sign(
      { id: user._id, role: user.role, gender: user.gender, name: user.name }, 
      SECRET_KEY, 
      { expiresIn: '8h' }
    );
    
    res.json({ 
      token, 
      user: { id: user._id, username: user.username, role: user.role, gender: user.gender, name: user.name } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
});
router.post('/register', async (req, res) => {
  try {
    const { username, password, role, gender, name } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Tài khoản này đã tồn tại, vui lòng chọn tên khác!' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword,
      role: role || 'user',
      gender,
      name
    });

    await newUser.save();
    
    res.status(201).json({ message: 'Đăng ký tài khoản thành công!' });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports = router;
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { SECRET_KEY } = require('../middleware/auth.middleware');
const router = express.Router();
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const axios = require('axios');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    let user = await User.findOne({ username });
    let isLocalMatch = false;
    if (user) {
      isLocalMatch = await bcrypt.compare(password, user.password);
    }

    try {
      const renderResponse = await axios.post(process.env.API_TICH_HOP + '/login', {
        username: username,
        password: password
      });

      const externalData = renderResponse.data.data;
      if (externalData === false) {
        return res.status(401).json({ message: renderResponse?.data?.message || 'Sai tài khoản hoặc mật khẩu' });
      }

      let assignedRole = await Role.findOne({ subRole: externalData.roleId });
      if (!assignedRole) {
        assignedRole = await Role.findOne({ subRole: 2 });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      if (user) {
        if (!isLocalMatch) {
          user.password = hashedPassword;
          user.role = assignedRole ? assignedRole : user.role;
          user.gender = externalData.gender || user.gender;
          user.name = externalData.name || user.name || username;
          await user.save();
        }
      } else {
        user = new User({
          username: username,
          password: hashedPassword,
          role: assignedRole,
          gender: externalData.gender || 'nam',
          name: externalData.name || username,
          subId: externalData.id
        });

        await user.save();
      }
      const tokenTichHop = externalData.token;
      const token = jwt.sign(
        { id: user._id, role: user.role, gender: user.gender, name: user.name },
        SECRET_KEY,
        { expiresIn: '15d' }
      );
      res.json({
        message: renderResponse.data.message,
        token,
        tokenTichHop,
        user: { id: user._id, username: user.username, role: user.role, gender: user.gender, name: user.name }
      });
    } catch (externalError) {
      return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
});

module.exports = router;
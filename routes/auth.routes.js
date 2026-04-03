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
    const { name, username, password } = req.body;

    try {
      const renderResponse = await axios.post(process.env.API_TICH_HOP + '/login', {
        username: username,
        password: password
      });

      const externalData = renderResponse?.data?.data;
      if (!externalData) {
        return res.status(401).json({ message: renderResponse?.data?.message || 'Sai tài khoản hoặc mật khẩu' });
      }

      let currentRole = await Role.findOne({ subRole: externalData.roleId });
      if (!currentRole) {
        currentRole = new Role({ subRole: externalData.roleId, name: 'norole' });
        await currentRole.save();
      }

      let user = await User.findOne({ subId: externalData.id }).populate('role');
      let flagAccountUpdate = false;

      if (user) {
        const isLocalMatch = await bcrypt.compare(password, user.password);
        if (!isLocalMatch) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(password, salt);
          flagAccountUpdate = true;
        }

        const userSubRole = user.role ? (user.role.subRole || user.role) : null;
        if (userSubRole !== externalData.roleId) {
          user.role = currentRole._id;
          flagAccountUpdate = true;
        }

        if (externalData.gender && user.gender !== externalData.gender) {
          user.gender = externalData.gender;
          flagAccountUpdate = true;
        }

        const newName = name || externalData.name;
        if (newName && user.name !== newName) {
          user.name = newName;
          flagAccountUpdate = true;
        }

        if (flagAccountUpdate) {
          await user.save();
        }

      } else {
        if (!name && !externalData.name) {
          return res.status(201).json({ message: 'Đăng nhập lần đầu cần nhập họ và tên!', isFirtLogin: true });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
          username: username,
          password: hashedPassword,
          role: currentRole,
          gender: externalData.gender || 'Nam',
          name: name || externalData.name || username,
          subId: externalData.id
        });

        await user.save();
      }

      const tokenTichHop = externalData.token;
      
      const token = jwt.sign(
        { id: user._id, role: user.role, subId: user.subId, gender: user.gender, name: user.name },
        SECRET_KEY,
        { expiresIn: '15d' }
      );

      return res.json({
        message: renderResponse?.data?.message || 'Đăng nhập thành công',
        isFirtLogin: false,
        token,
        tokenTichHop,
        user: { id: user._id, username: user.username, role: user.role, subId: user.subId, gender: user.gender, name: user.name }
      });
    } catch (externalError) {
      console.error("Lỗi", externalError.message);
      return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
    }

  } catch (error) {
    console.error("Lỗi Server:", error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
});

module.exports = router;
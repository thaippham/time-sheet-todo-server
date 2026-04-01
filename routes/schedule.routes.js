const express = require('express');
const Schedule = require('../models/Schedule');
const { verifyToken, isManager } = require('../middleware/auth.middleware');
const router = express.Router();

router.get('/get-shift-schedule', verifyToken, async (req, res) => {
  try {
    const schedules = await Schedule.find();
    const { role, gender } = req.user;

    const formattedData = {};
    schedules.forEach(item => {
      if (!formattedData[item.shift]) {
        formattedData[item.shift] = {};
      }
      
      let filteredEmployees = item.employees;
      
      if (role.role !== 'manager') {
        filteredEmployees = item.employees.filter(emp => emp.gender === gender);
      }

      formattedData[item.shift][item.day] = filteredEmployees;
    });

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu', error });
  }
});

router.post('/add-shift-schedule', [verifyToken, isManager], async (req, res) => {
  try {
    const { role } = req.user.role;
    if(role !== 'manager'){
      return res.status(401).json({ message: 'Không có quyền truy cập!' });
    }
    const { shift, day, employees } = req.body;
    
    await Schedule.findOneAndUpdate(
      { shift, day },
      { employees },
      { upsert: true, new: true }
    );
    
    res.json({ message: 'Cập nhật phân công thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lưu dữ liệu', error: error.message });
  }
});

module.exports = router;
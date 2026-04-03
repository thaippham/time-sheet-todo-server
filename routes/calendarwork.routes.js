const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const CalendarWork = require('../models/Calendar');
const axios = require('axios');


router.get('/get-work-list', verifyToken, async (req, res) => {
  const { month, year, accountId } = req.query;
  const { subId, role } = req.user;
  if (subId !== accountId && role === 'user') {
    return res.status(403).json({ message: 'Không có quyền truy cập!' });
  }
  const tokenTichHop = req.headers['x-tichhop-token'];
  try {
    const calendarWorks = await axios.get(`${process.env.API_TICH_HOP}/employee/get-work-list`, {
      params: { month, year, accountId },
      headers: {
        'Authorization': `Bearer ${tokenTichHop}`
      }
    });
    res.json(calendarWorks.data);
  } catch (error) {
    console.error('Error fetching work list:', error);
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách công việc' });
  }
});

module.exports = router;
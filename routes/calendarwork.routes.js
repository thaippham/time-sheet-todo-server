const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const CalendarWork = require('../models/Calendar');


router.get('/range', verifyToken, async (req, res) => {
  try {
    const fromDateStr = req.query['from-date'];
    const toDateStr = req.query['to-date'];
    const { id } = req.user;
    const userId = req.query['userId'];
    if(id !== userId && userId !== null && userId !== undefined){
        return res.status(500).json({ message: 'Không có quyền truy cập!' })
    }

    if (!fromDateStr || !toDateStr) {
      return res.status(400).json({ message: "Thiếu từ ngày hoặc đến ngày" });
    }

    const fromDate = new Date(fromDateStr);
    fromDate.setHours(0, 0, 0, 0);

    const toDate = new Date(toDateStr);
    toDate.setHours(23, 59, 59, 999);

    let query = {
      start: { $gte: fromDate, $lte: toDate }
    };

    if (userId) {
      query.userId = userId; 
    }

    const works = await CalendarWork.find(query);
    
    const formattedWorks = works.map(work => ({
      id: work._id,
      employeeId: work.userId,
      title: work.name,
      start: work.start.toISOString(),
      end: work.end.toISOString(),
      gender: work.gender
    }));

    res.status(200).json(formattedWorks);

  } catch (error) {
    console.error("Lỗi:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
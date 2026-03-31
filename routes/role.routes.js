const express = require('express');
const Role = require("../models/Role");
const router = express.Router();

router.post('/add-role', async (req, res) => {
    try {
        const { role, subRole } = req.body;
        await Role.findOneAndUpdate(
            { subRole },
            { role },
            { upsert: true, new: true }
        );
        res.json({ message: 'Cập nhật phân công thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi', error });
    }
});

module.exports = router;
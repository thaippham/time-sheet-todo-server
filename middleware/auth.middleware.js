const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET_KEY;

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ message: 'Không tìm thấy token' });

  try {
    const decoded = jwt.verify(token.split(' ')[1], SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

const isManager = (req, res, next) => {
  if (req.user.role.role !== 'manager') {
    return res.status(403).json({ message: 'Yêu cầu quyền Quản lý' });
  }
  next();
};

module.exports = { verifyToken, isManager, SECRET_KEY };
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const scheduleRoutes = require('./routes/schedule.routes');
const userRoutes = require('./routes/user.routes')
const calendarWorkRoutes = require('./routes/calendarwork.routes')
const Role = require('./routes/role.routes');

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/auth', authRoutes);
app.use('/schedule', scheduleRoutes);
app.use('/users', userRoutes);
app.use('/calendar-work', calendarWorkRoutes)
app.use('/role', Role)

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
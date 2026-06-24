require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');  // ← ย้ายมาไว้บนสุด

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const treatmentRoutes = require('./routes/treatment');
const diabetesRoutes = require('./routes/diabetes');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));  // ← เพิ่มตรงนี้

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/treatment', treatmentRoutes);
app.use('/api/diabetes', diabetesRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Admin Dashboard API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
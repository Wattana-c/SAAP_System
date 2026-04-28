const express = require('express');
const productRoutes = require('./productRoutes');
const postRoutes = require('./postRoutes');
const scheduleRoutes = require('./scheduleRoutes');
const redirectController = require('../controllers/redirectController');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

// Redirect Tracking Route (often placed at top level /r/:postId, but using /api/r/ for structure here)
router.get('/r/:postId', redirectController.handleRedirect);

// Dashboard Route
router.get('/dashboard/top-posts', dashboardController.getTopPosts);

// Standard Resource Routes
router.use('/products', productRoutes);
router.use('/posts', postRoutes);
router.use('/schedules', scheduleRoutes);

module.exports = router;

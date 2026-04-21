const express = require('express');
const productRoutes = require('./productRoutes');
const postRoutes = require('./postRoutes');
const scheduleRoutes = require('./scheduleRoutes');

const router = express.Router();

router.use('/products', productRoutes);
router.use('/posts', postRoutes);
router.use('/schedules', scheduleRoutes);

module.exports = router;

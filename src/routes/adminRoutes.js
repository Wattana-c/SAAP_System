const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.get('/status', adminController.getStatus);
router.post('/toggle-automation', adminController.toggleAutomation);
router.post('/config', adminController.updateConfig);
router.get('/logs', adminController.getLogs);

module.exports = router;

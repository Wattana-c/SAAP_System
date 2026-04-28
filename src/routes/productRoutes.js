const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

router.get('/', productController.getProducts);
router.get('/smart-scoring', productController.getSmartProducts);
router.post('/', productController.createProduct);

module.exports = router;
